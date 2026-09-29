// Adapted from act by artalar (https://github.com/artalar/act), MIT licence.
import { hasSome, isSomeFunction } from '@reely/basics';
import type { Nullable } from '@reely/utils';
import { hasProperty, isInstanceOf } from '@reely/utils';

import type { Reelx, RlxDerivedState, RlxState } from './reelx.types';

type WithSubscribers<T> = T & { _subscribers: Set<Subscriber> };

interface Subscriber {
  (): void;
  _values: Array<WithSubscribers<RlxState<unknown>>>;
}

const unlink = (subscriber: Subscriber): void => {
  for (const { _subscribers } of subscriber._values.splice(0)) {
    _subscribers.delete(subscriber);
  }
};

const removeWhere = <T>(list: T[], matches: (item: T) => boolean): void => {
  let kept = 0;
  for (const item of list) {
    if (!matches(item)) {
      list[kept++] = item;
    }
  }
  list.length = kept;
};

interface Dependency<T> {
  readonly computation: RlxState<T> | RlxDerivedState<T>;
  /** What the read gave: the value, or what it threw. */
  readonly value: unknown;
  readonly threw: boolean;
}
type Dependencies<T> = Dependency<T>[];

const isUnchanged = <T>({ computation, value, threw }: Dependency<T>): boolean => {
  try {
    return !threw && Object.is(value, computation());
  } catch (error) {
    return threw && Object.is(value, error);
  }
};

type RlxSelfInstance<T> = WithSubscribers<
  RlxState<T> &
    RlxDerivedState<T> & {
      toString(): string;
      toJSON(): T;
    }
>;

/** subscribers from all touched signals */
let QUEUE: Array<Set<Subscriber>> = [];

/** global queue cache flag */
let QUEUE_VERSION = 0;

/** current subscriber during invalidation */
let SUBSCRIBER: null | Subscriber = null;

/** global subscriber pull cache flag */
let SUBSCRIBER_VERSION = 0;

/** stack-based parent ref to silently link nodes */
let DEPS: null | Dependencies<unknown> = null;

/** nesting depth of `batch` calls; subscribers run when the outermost one ends */
let BATCH_DEPTH = 0;

/** true while `flushSync` runs subscribers; writes made meanwhile join the same flush */
let FLUSHING = false;

/** How many waves of writes one flush runs before it takes them for a cycle of effects. */
const MAX_FLUSH_WAVES = 100;

/** What a reelx is made from: a computation, or the initial value of a state, a function included. */
type ReelxSource<T> = { readonly kind: 'computed'; readonly compute: () => T } | { readonly kind: 'state'; readonly initial: T };

const createReelx = <T>(source: ReelxSource<T>, equal?: (prev: T, next: T) => boolean): RlxSelfInstance<T> => {
  let queueVersion = -1;
  let subscriberVersion = -1;
  let state: T;
  let rlxSelf: RlxSelfInstance<T>;

  if (source.kind === 'computed') {
    const init = source.compute;
    const deps: Dependencies<T> = [];
    // a computation that tracked nothing is a constant once it has run
    let hasRun = false;
    // what the last run threw: kept like a result and thrown on every read until a dependency changes
    let thrown: Nullable<{ readonly error: unknown }> = null;
    // @ts-expect-error expected properties assigned below
    rlxSelf = (): T => {
      if (subscriberVersion !== SUBSCRIBER_VERSION) {
        if (queueVersion === QUEUE_VERSION && SUBSCRIBER !== null && rlxSelf._subscribers.size !== 0) {
          const [firstS] = rlxSelf._subscribers ?? [];
          if (firstS) {
            for (const { _subscribers } of firstS._values) {
              if (_subscribers.size !== _subscribers.add(SUBSCRIBER).size) {
                SUBSCRIBER._values.push(rlxSelf);
              }
            }
          }
        } else {
          const prevDeps = DEPS;
          DEPS = null;

          try {
            if (!hasRun || !deps.every(isUnchanged)) {
              (DEPS = deps).length = 0;

              try {
                const newState = init();
                thrown = null;
                if (
                  equal === undefined ||
                  // first call
                  state === undefined ||
                  !equal(state, newState)
                ) {
                  state = newState;
                }
              } catch (error) {
                thrown = { error };
              }
              hasRun = true;
            }
          } finally {
            DEPS = prevDeps;
          }
        }
        queueVersion = QUEUE_VERSION;
        subscriberVersion = SUBSCRIBER_VERSION;
      }

      DEPS?.push({ computation: rlxSelf, value: hasSome(thrown) ? thrown.error : state, threw: hasSome(thrown) });

      if (hasSome(thrown)) {
        throw thrown.error;
      }
      return state;
    };
  } else {
    state = source.initial;
    // @ts-expect-error expected properties assigned below
    rlxSelf = (...args: [] | [newState: T]): T => {
      // a call with an argument writes, even `undefined`; a call without one reads
      if (args.length === 1 && !Object.is(args[0], state)) {
        const [newState] = args;
        // mark all computed(s) dirty
        ++SUBSCRIBER_VERSION;

        state = newState;

        const subscribers = rlxSelf._subscribers;
        // replace before scheduling: a synchronous flush re-subscribes to the new set
        rlxSelf._subscribers = new Set();

        // a run does not depend on what it writes, even after reading it: its own write
        // neither runs it again nor unlinks it from the rest of what it read
        if (SUBSCRIBER !== null && subscribers.delete(SUBSCRIBER)) {
          removeWhere(SUBSCRIBER._values, (value) => value === rlxSelf);
        }
        if (DEPS !== null) {
          removeWhere(DEPS, ({ computation }) => computation === rlxSelf);
        }

        if (QUEUE.push(subscribers) === 1) {
          QUEUE_VERSION++;
          reelx.schedule?.();
        }
        return state;
      }

      if (SUBSCRIBER !== null && rlxSelf._subscribers.size !== rlxSelf._subscribers.add(SUBSCRIBER).size) {
        SUBSCRIBER._values.push(rlxSelf);
      }

      DEPS?.push({ computation: rlxSelf, value: state, threw: false });

      return state;
    };
  }

  rlxSelf.subscribe = (cb) => {
    let queueVersion = -1;
    let lastState: unknown;
    let prevState: T | undefined;
    let isDisposed = false;

    const subscriber: Subscriber = () => {
      // a subscriber disposed inside `batch` may still be queued
      if (!isDisposed && queueVersion !== QUEUE_VERSION) {
        // a subscription made inside another computation is a new root: it must not
        // steal the outer subscriber or leak into the outer dependencies
        const prevSubscriber = SUBSCRIBER;
        const prevDeps = DEPS;
        DEPS = null;
        try {
          queueVersion = QUEUE_VERSION;

          unlink(subscriber);

          SUBSCRIBER = subscriber;

          SUBSCRIBER_VERSION++;

          if (rlxSelf() !== lastState) {
            cb((lastState = state), prevState);
            prevState = state;
          }
        } finally {
          SUBSCRIBER = prevSubscriber;
          DEPS = prevDeps;
        }
      }
    };
    subscriber._values = [];

    try {
      subscriber();
    } catch (error) {
      // a first run that throws leaves no subscription behind
      unlink(subscriber);
      throw error;
    }
    rlxSelf._subscribers.add(subscriber);

    return (): void => {
      isDisposed = true;
      rlxSelf._subscribers.delete(subscriber);
      if (rlxSelf._subscribers.size === 0) {
        unlink(subscriber);
      }
    };
  };

  rlxSelf._subscribers = new Set();
  rlxSelf.toString = (): string => state + '';
  // @ts-expect-error state as object
  rlxSelf.valueOf = (): object => state;
  rlxSelf.toJSON = (): T => state;

  return rlxSelf;
};

export const reelx: Reelx = <T>(init: (() => T) | T, equal?: (prev: T, next: T) => boolean) =>
  createReelx<T>(isSomeFunction(init) ? { kind: 'computed', compute: init } : { kind: 'state', initial: init }, equal);

reelx.state = <T>(initial: T): RlxState<T> => createReelx({ kind: 'state', initial });

export function reelxDebug<S>(rlx: RlxState<S> | RlxDerivedState<S>): {
  /** How many subscriptions read it now: tests count them to prove that `dispose` released them. */
  subscriberCount: () => number;
} {
  return {
    subscriberCount: (): number =>
      hasProperty('_subscribers', rlx) && isInstanceOf(Set, rlx._subscribers) ? rlx._subscribers.size : 0,
  };
}

reelx.flushSync = (): void => {
  if (FLUSHING) {
    return;
  }
  FLUSHING = true;
  // every subscriber runs even if one throws; the first error is rethrown at the end
  const errors: unknown[] = [];
  let waves = 0;
  try {
    while (QUEUE.length > 0) {
      if (++waves > MAX_FLUSH_WAVES) {
        QUEUE = [];
        throw new Error(`reelx: a cycle of effects, each writes a signal another one reads (${MAX_FLUSH_WAVES} waves)`, {
          cause: errors[0],
        });
      }
      const iterator = QUEUE;
      QUEUE = [];
      for (const subscribers of iterator) {
        for (const subscriber of subscribers) {
          try {
            subscriber();
          } catch (error) {
            errors.push(error);
          }
        }
      }
    }
  } finally {
    FLUSHING = false;
  }
  if (errors.length > 0) {
    throw errors[0];
  }
};

reelx.untracked = <T>(fn: () => T): T => {
  const prevSubscriber = SUBSCRIBER;
  const prevDeps = DEPS;
  SUBSCRIBER = null;
  DEPS = null;
  try {
    return fn();
  } finally {
    SUBSCRIBER = prevSubscriber;
    DEPS = prevDeps;
  }
};

reelx.batch = <T>(fn: () => T): T => {
  BATCH_DEPTH++;
  try {
    return fn();
  } finally {
    if (--BATCH_DEPTH === 0) {
      reelx.flushSync();
    }
  }
};

/** Runs subscribers synchronously after a write, or at the end of the outermost `batch`. */
reelx.schedule = (): void => {
  if (BATCH_DEPTH === 0) {
    reelx.flushSync();
  }
};
