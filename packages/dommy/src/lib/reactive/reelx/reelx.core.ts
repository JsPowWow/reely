import type { Nullable } from '@reely/utils';
import { hasProperty, hasSome, isSomeFunction } from '@reely/utils';

import type { Reelx, RlxDerivedState, RlxState } from './reelx.types';

type WithSubscribers<T> = T & { _subscribers: Set<Subscriber> };

/** value subscriber */
interface Subscriber {
  (): void;
  _values: Array<WithSubscribers<RlxState<unknown>>>;
}

/** node dependencies list */
type Dependencies<T> = { computation: RlxState<T> | RlxDerivedState<T>; value: T }[];

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

export const reelx: Reelx = <T>(init: (() => T) | T, equal?: (prev: T, next: T) => boolean) => {
  let queueVersion = -1;
  let subscriberVersion = -1;
  let state: T;
  let rlxSelf: RlxSelfInstance<T>;

  if (isSomeFunction(init)) {
    const deps: Dependencies<T> = [];
    // a computation that tracked nothing is a constant once computed
    let computed = false;
    // @ts-expect-error expected properties assigned below
    rlxSelf = (): T => {
      if (subscriberVersion !== SUBSCRIBER_VERSION) {
        if (queueVersion === QUEUE_VERSION && SUBSCRIBER !== null && rlxSelf._subscribers.size !== 0) {
          const [firstS] = rlxSelf._subscribers ?? [];
          // console.log(new Set([1, 2, 3]).values().next().value);
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
            let isActual = computed;
            for (let i = 0; isActual && i < deps.length; i++) {
              isActual = Object.is(deps[i]?.value, deps[i]?.computation());
            }
            if (!isActual) {
              (DEPS = deps).length = 0;

              const newState = init();
              computed = true;

              if (
                equal === undefined ||
                // first call
                state === undefined ||
                !equal(state, newState)
              ) {
                state = newState;
              }
            }
          } finally {
            DEPS = prevDeps;
          }
        }
        queueVersion = QUEUE_VERSION;
        subscriberVersion = SUBSCRIBER_VERSION;
      }

      DEPS?.push({ computation: rlxSelf, value: state });

      return state;
    };
  } else {
    state = init;
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

        if (QUEUE.push(subscribers) === 1) {
          QUEUE_VERSION++;
          reelx.schedule?.();
        }
      }

      if (SUBSCRIBER !== null && rlxSelf._subscribers.size !== rlxSelf._subscribers.add(SUBSCRIBER).size) {
        SUBSCRIBER._values.push(rlxSelf);
      }

      DEPS?.push({ computation: rlxSelf, value: state });

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

          for (const { _subscribers } of subscriber._values.splice(0)) _subscribers.delete(subscriber);

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

    subscriber();
    rlxSelf._subscribers.add(subscriber);

    return (): void => {
      isDisposed = true;
      rlxSelf._subscribers.delete(subscriber);
      if (rlxSelf._subscribers.size === 0) {
        for (const { _subscribers } of subscriber._values) _subscribers.delete(subscriber);
      }
    };
  };

  rlxSelf._subscribers = new Set();
  rlxSelf.toString = (): string => state + '';
  // @ts-expect-error state as object
  rlxSelf.valueOf = (): object => state;
  rlxSelf.toJSON = (): T => state;
  // rlxSelf.peek = (): T => {
  //   throw new Error('Mot implemented');
  // };

  return rlxSelf;
};

export function reelxDebug<S>(rlx: RlxState<S> | RlxDerivedState<S>): {
  subs: () => Nullable<Set<Subscriber>>;
} {
  return {
    subs: (): Nullable<Set<Subscriber>> => {
      const subs: unknown = hasProperty('_subscribers', rlx) ? rlx._subscribers : undefined;
      return hasSome<Set<Subscriber>>(subs) ? subs : undefined;
    },
  };
}

reelx.flushSync = (): void => {
  if (FLUSHING) {
    return;
  }
  FLUSHING = true;
  // every subscriber runs even if one throws; the first error is rethrown at the end
  const errors: unknown[] = [];
  try {
    while (QUEUE.length > 0) {
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

/** Runs `fn` without subscribing the running computation or effect to what `fn` reads. */
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
