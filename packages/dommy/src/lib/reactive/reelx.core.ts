import type { Nullable } from '@reely/utils';
import { hasProperty, hasSome, isSomeFunction } from '@reely/utils';

import type { Reelx, RlxDerived, RlxValue } from './reelx.types';

type WithSubscribers<T> = {
  _subscribers: Set<Subscriber>;
} & T;

interface Subscriber {
  (): void;
  _values: Array<WithSubscribers<RlxValue<unknown>>>;
}

/** node dependencies list */
type Dependencies<T> = { c: RlxValue<T> | RlxDerived<T>; v: T }[];

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

const emptyArray = Object.freeze([]);

export const reelxCore: Reelx = <T>(init: (() => T) | T, equal?: (prev: T, next: T) => boolean) => {
  let queueVersion = -1;
  let subscriberVersion = -1;
  let stateVal: T;
  let reelxInstance: WithSubscribers<RlxValue<T> & RlxDerived<T>>;

  if (isSomeFunction(init)) {
    const deps: Dependencies<T> = [];
    // @ts-expect-error expected properties assigned below
    reelxInstance = (): T => {
      if (subscriberVersion !== SUBSCRIBER_VERSION) {
        if (queueVersion === QUEUE_VERSION && SUBSCRIBER !== null && reelxInstance._subscribers.size !== 0) {
          const [firstS] = reelxInstance._subscribers ?? emptyArray;
          if (firstS) {
            for (const { _subscribers } of firstS._values) {
              if (_subscribers.size !== _subscribers.add(SUBSCRIBER).size) {
                SUBSCRIBER._values.push(reelxInstance);
              }
            }
          }
        } else {
          const prevDeps = DEPS;
          DEPS = null;

          try {
            let isActual = deps.length > 0;
            for (let i = 0; isActual && i < deps.length; i += 2) {
              isActual = Object.is(deps[i + 1]?.v, deps[i]?.c());
            }

            if (!isActual) {
              (DEPS = deps).length = 0;

              const newState = init();

              if (
                equal === undefined ||
                // first call
                stateVal === undefined ||
                !equal(stateVal, newState)
              ) {
                stateVal = newState;
              }
            }
          } finally {
            DEPS = prevDeps;
          }
        }
        queueVersion = QUEUE_VERSION;
        subscriberVersion = SUBSCRIBER_VERSION;
      }

      DEPS?.push({ c: reelxInstance, v: stateVal });

      return stateVal;
    };
  } else {
    stateVal = init;
    // @ts-expect-error expected properties assigned below
    reelxInstance = (newState: T): T => {
      if (newState !== undefined && !Object.is(newState, stateVal)) {
        // mark all computed(s) dirty
        ++SUBSCRIBER_VERSION;

        stateVal = newState;

        if (QUEUE.push(reelxInstance._subscribers) === 1) {
          QUEUE_VERSION++;
          reelxCore.notify.schedule?.();
        }

        reelxInstance._subscribers = new Set();
      }

      if (SUBSCRIBER !== null && reelxInstance._subscribers.size !== reelxInstance._subscribers.add(SUBSCRIBER).size) {
        SUBSCRIBER._values.push(reelxInstance);
      }

      DEPS?.push({ c: reelxInstance, v: stateVal });

      return stateVal;
    };
  }

  reelxInstance.subscribe = (cb) => {
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

          if (reelxInstance() !== lastState) {
            cb((lastState = stateVal), prevState);
            prevState = stateVal;
          }
        } finally {
          SUBSCRIBER = null;
        }
      }
    };
    subscriber._values = [];

    subscriber();
    reelxInstance._subscribers.add(subscriber);

    return (): void => {
      reelxInstance._subscribers.delete(subscriber);
      if (reelxInstance._subscribers.size === 0) {
        for (const { _subscribers } of subscriber._values) _subscribers.delete(subscriber);
      }
    };
  };

  reelxInstance._subscribers = new Set();

  return reelxInstance;
};

export function reelxDebug<S>(rlx: RlxValue<S> | RlxDerived<S>): {
  subs: () => Nullable<Set<Subscriber>>;
} {
  return {
    subs: (): Nullable<Set<Subscriber>> => {
      const subs: unknown = hasProperty('_subscribers', rlx) ? rlx._subscribers : undefined;
      return hasSome<Set<Subscriber>>(subs) ? subs : undefined;
    },
  };
}

reelxCore.notify = (): void => {
  const iterator = QUEUE;

  QUEUE = [];

  for (const subscribers of iterator) {
    for (const subscriber of subscribers) subscriber();
  }
};

reelxCore.notify.schedule = (): Promise<void> => Promise.resolve().then(reelxCore.notify);
