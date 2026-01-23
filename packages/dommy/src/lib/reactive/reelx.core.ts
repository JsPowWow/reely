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

export const reelx: Reelx = <T>(init: (() => T) | T, equal?: (prev: T, next: T) => boolean) => {
  let queueVersion = -1;
  let subscriberVersion = -1;
  let state: T;
  let rlxSelf: WithSubscribers<RlxState<T> & RlxDerivedState<T>>;

  if (isSomeFunction(init)) {
    const deps: Dependencies<T> = [];
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
            let isActual = deps.length > 0;
            for (let i = 0; isActual && i < deps.length; i++) {
              isActual = Object.is(deps[i]?.value, deps[i]?.computation());
            }
            if (!isActual) {
              (DEPS = deps).length = 0;

              const newState = init();

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
    rlxSelf = (newState: T): T => {
      if (newState !== undefined && !Object.is(newState, state)) {
        // mark all computed(s) dirty
        ++SUBSCRIBER_VERSION;

        state = newState;

        if (QUEUE.push(rlxSelf._subscribers) === 1) {
          QUEUE_VERSION++;
          reelx.schedule?.();
        }

        rlxSelf._subscribers = new Set();
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

    const subscriber: Subscriber = () => {
      if (queueVersion !== QUEUE_VERSION) {
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
          SUBSCRIBER = null;
        }
      }
    };
    subscriber._values = [];

    subscriber();
    rlxSelf._subscribers.add(subscriber);

    return (): void => {
      rlxSelf._subscribers.delete(subscriber);
      if (rlxSelf._subscribers.size === 0) {
        for (const { _subscribers } of subscriber._values) _subscribers.delete(subscriber);
      }
    };
  };

  rlxSelf._subscribers = new Set();

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
  const iterator = QUEUE;

  QUEUE = [];

  for (const subscribers of iterator) {
    for (const subscriber of subscribers) subscriber();
  }
};

reelx.schedule = (): Promise<void> => Promise.resolve().then(reelx.flushSync);
