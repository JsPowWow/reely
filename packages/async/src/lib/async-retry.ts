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
  public code = 'TIMEOUT';

  constructor(message = 'The attempt took too long') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/** A task `retry` calls: the attempt number from 0, and a signal to pass on, to `fetch` say. */
export type RetryTask<T> = (attempt: number, signal: AbortSignal) => Promise<T>;

// Rejects with the signal's reason once it aborts; the listener goes when `settled` does.
const abortOf = (signal: AbortSignal, settled: Promise<unknown>): Promise<never> =>
  new Promise((_, reject) => {
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

const attempt = async <T>(task: RetryTask<T>, number: number, timeout?: number, outer?: AbortSignal): Promise<T> => {
  const limit = new AbortController();
  const timer =
    timeout === undefined
      ? undefined
      : setTimeout(() => limit.abort(new TimeoutError(`The attempt took longer than ${timeout} ms`)), timeout);
  const signal = outer ? AbortSignal.any([outer, limit.signal]) : limit.signal;
  const running = Promise.resolve().then(() => task(number, signal));
  try {
    return await Promise.race([running, abortOf(signal, running)]);
  } finally {
    clearTimeout(timer);
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
    onRetry = (): void => {
      return;
    },
    shouldRetry = (): boolean => true,
    timeout,
    signal,
  } = options;

  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let number = 0; number <= retries; number++) {
    signal?.throwIfAborted();
    try {
      return await attempt(fn, number, timeout, signal);
    } catch (error) {
      if (signal?.aborted) {
        throw signal.reason;
      }
      lastError = error instanceof Error ? error : new Error(String(error));

      if (number === retries || !shouldRetry(lastError, number)) {
        throw error;
      }

      onRetry(lastError, number, currentDelay);

      await sleep(currentDelay, signal);

      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Create a reusable retry wrapper with preset options
 */
export function createRetry(
  defaultOptions: RetryOptions = {}
): <T>(fn: RetryTask<T>, overrides?: RetryOptions) => Promise<T> {
  return <T>(
    fn: RetryTask<T>,
    overrides: RetryOptions = {}
  ): Promise<T> => {
    return retry(fn, { ...defaultOptions, ...overrides });
  };
}

/**
 * Wrap a function to always retry on failure
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(fn: T, options?: RetryOptions): T;
export function withRetry(
  fn: (...args: unknown[]) => Promise<unknown>,
  options: RetryOptions = {}
): (...args: unknown[]) => Promise<unknown> {
  return (...args) => retry(() => fn(...args), options);
}

/**
 * Execute multiple async operations with individual retry logic
 */
export async function retryAll<T>(
  fns: Array<RetryTask<T>>,
  options: RetryOptions = {}
): Promise<T[]> {
  return Promise.all(fns.map((fn) => retry(fn, options)));
}

/**
 * Resolves with the first task to succeed after its retries; rejects with an `AggregateError` of
 * every task's error once all fail.
 */
export async function retryRace<T>(
  fns: Array<RetryTask<T>>,
  options: RetryOptions = {}
): Promise<T> {
  return Promise.any(fns.map((fn) => retry(fn, options)));
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
