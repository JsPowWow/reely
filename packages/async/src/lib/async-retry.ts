import { isSomeFunction, toErrorWithMessage } from '@reely/basics';

export interface RetryOptions {
  /** Maximum number of retries (default: 3) */
  retries?: number;
  /** Initial delay in ms (default: 1000) */
  delay?: number;
  /** Maximum delay in ms (default: 30000) */
  maxDelay?: number;
  /** Exponential backoff factor (default: 2) */
  factor?: number;
  /** Called before the delay of each retry. */
  onRetry?: (error: Error, attempt: number, nextDelay: number) => void;
  /** Returning `false` stops retrying and rethrows the error. */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** The longest an attempt may run, in ms: then it fails with a `TimeoutError` and its signal aborts. */
  timeout?: number;
  /** Stops everything: the attempt's signal aborts, no retry follows, and `retry` rejects with the reason. */
  signal?: AbortSignal;
}

/** What an attempt fails with when it runs longer than `timeout`. */
export class TimeoutError extends Error {
  public readonly code = 'TIMEOUT';

  constructor(message = 'The attempt took too long') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/** A task `retry` calls: the attempt number from 0, and a signal to pass on, to `fetch` say. */
export type RetryTask<T> = (attempt: number, signal: AbortSignal) => Promise<T>;

interface Followed {
  signal: AbortSignal;
  release: () => void;
}

// `own`'s signal, which `outer` aborts too: `AbortSignal.any` where the platform has it, and before it
// (Safari 17.4, older iPads) a listener on `outer` that aborts `own`, removed by `release`.
const follow = (own: AbortController, outer: AbortSignal | undefined): Followed => {
  if (!outer) {
    return { signal: own.signal, release: () => undefined };
  }
  if (isSomeFunction(AbortSignal.any)) {
    return { signal: AbortSignal.any([outer, own.signal]), release: () => undefined };
  }
  const abort = (): void => own.abort(outer.reason);
  if (outer.aborted) {
    abort();
  } else {
    outer.addEventListener('abort', abort, { once: true });
  }
  return { signal: own.signal, release: () => outer.removeEventListener('abort', abort) };
};

// Rejects with the signal's reason once it aborts, at once if it has; the listener goes when `settled` does.
const abortOf = (signal: AbortSignal, settled: Promise<unknown>): Promise<never> =>
  new Promise((_, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = (): void => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    void settled.finally(() => signal.removeEventListener('abort', onAbort)).catch(() => undefined);
  });

const sleep = (ms: number, signal: AbortSignal | undefined): Promise<void> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const slept = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  if (!signal) {
    return slept;
  }
  return Promise.race([slept, abortOf(signal, slept)]).finally(() => clearTimeout(timer));
};

type AttemptLimits = Pick<RetryOptions, 'timeout' | 'signal'>;

const runAttempt = async <T>(task: RetryTask<T>, attempt: number, { timeout, signal }: AttemptLimits): Promise<T> => {
  const timeLimit = new AbortController();
  const timer =
    timeout === undefined
      ? undefined
      : setTimeout(() => timeLimit.abort(new TimeoutError(`The attempt took longer than ${timeout} ms`)), timeout);
  const followed = follow(timeLimit, signal);
  const running = Promise.resolve().then(() => task(attempt, followed.signal));
  try {
    return await Promise.race([running, abortOf(followed.signal, running)]);
  } finally {
    clearTimeout(timer);
    followed.release();
  }
};

/**
 * Retry failed async functions with exponential backoff
 */
export async function retry<T>(fn: RetryTask<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry,
    shouldRetry = (): boolean => true,
    signal,
  } = options;

  let currentDelay = Math.min(delay, maxDelay);

  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted();
    try {
      return await runAttempt(fn, attempt, options);
    } catch (error) {
      if (signal?.aborted) {
        throw signal.reason;
      }
      const failure = toErrorWithMessage(error);
      const retriesLeft = attempt < retries;
      if (!retriesLeft || !shouldRetry(failure, attempt)) {
        throw error;
      }
      onRetry?.(failure, attempt, currentDelay);
      await sleep(currentDelay, signal);
      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }
}

// Runs every task under one signal, and stops those still running once `settle` has its answer.
const together = async <T, R>(
  fns: Array<RetryTask<T>>,
  options: RetryOptions,
  settle: (runs: Array<Promise<T>>) => Promise<R>
): Promise<R> => {
  const group = new AbortController();
  const followed = follow(group, options.signal);
  try {
    return await settle(fns.map((fn) => retry(fn, { ...options, signal: followed.signal })));
  } finally {
    group.abort(new Error('Another task settled the group'));
    followed.release();
  }
};

/**
 * Create a reusable retry wrapper with preset options
 */
export function createRetry(
  defaultOptions: RetryOptions = {}
): <T>(fn: RetryTask<T>, overrides?: RetryOptions) => Promise<T> {
  return <T>(fn: RetryTask<T>, overrides: RetryOptions = {}): Promise<T> => {
    return retry(fn, { ...defaultOptions, ...overrides });
  };
}

/**
 * Wrap a function to always retry on failure
 */
export function withRetry<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  options: RetryOptions = {}
): (...args: A) => Promise<R> {
  return (...args) => retry(() => fn(...args), options);
}

/**
 * Retries each task on its own and resolves with every result; once one fails for good, rejects with
 * its error and stops the others.
 */
export async function retryAll<T>(fns: Array<RetryTask<T>>, options: RetryOptions = {}): Promise<T[]> {
  return together(fns, options, (runs) => Promise.all(runs));
}

/**
 * Resolves with the first task to succeed after its retries; rejects with an `AggregateError` of
 * every task's error once all fail.
 */
export async function retryRace<T>(fns: Array<RetryTask<T>>, options: RetryOptions = {}): Promise<T> {
  return together(fns, options, (runs) => Promise.any(runs));
}

/**
 * Execute multiple async operations, returning all results (including errors)
 */
export async function retryAllSettled<T>(
  fns: Array<RetryTask<T>>,
  options: RetryOptions = {}
): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(fns.map((fn) => retry(fn, options)));
}
