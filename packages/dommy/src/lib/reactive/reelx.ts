import type { Nullable } from '@reely/utils';
import { hasProperty, hasSome, isSomeFunction } from '@reely/utils';

import type { Reelx, RlxComputedState, RlxValueState } from './reelx.types';

type WithSubscribers<T> = {
  _s: Set<Subscriber>;
} & T;

interface Subscriber {
  (): void;
  _values: Array<WithSubscribers<RlxValueState<unknown>>>;
}

type Dependencies<T> = [] | [RlxValueState<T> | RlxComputedState<T>, T];

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

export const reelx: Reelx = <T>(init: (() => T) | T, equal?: (prev: T, next: T) => boolean) => {
  let queueVersion = -1;
  let subscriberVersion = -1;
  let stateVal: T;
  let reelxInstance: WithSubscribers<RlxValueState<T> & RlxComputedState<T>>;

  if (isSomeFunction(init)) {
    const deps: Dependencies<T> = [];
    // @ts-expect-error expected properties assigned below
    reelxInstance = (): T => {
      if (subscriberVersion !== SUBSCRIBER_VERSION) {
        if (queueVersion === QUEUE_VERSION && SUBSCRIBER !== null && reelxInstance._s.size !== 0) {
          // for (const s of reelxInstance._s) {
          //   for (const { _s } of s._values)
          //     if (_s.size !== _s.add(SUBSCRIBER).size) SUBSCRIBER._values.push(reelxInstance);
          //   break;
          // }
          const [firstS] = reelxInstance._s ?? emptyArray;

          if (firstS) {
            for (const { _s } of firstS._values) {
              if (_s.size !== _s.add(SUBSCRIBER).size) {
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
              // @ts-expect-error can't type a structure
              isActual = Object.is(deps[i + 1], deps[i]());
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

      // @ts-expect-error can't type a structure
      DEPS?.push(reelxInstance, stateVal);

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

        if (QUEUE.push(reelxInstance._s) === 1) {
          QUEUE_VERSION++;
          reelx.notify.schedule?.();
        }

        reelxInstance._s = new Set();
      }

      if (SUBSCRIBER !== null && reelxInstance._s.size !== reelxInstance._s.add(SUBSCRIBER).size) {
        SUBSCRIBER._values.push(reelxInstance);
      }

      // @ts-expect-error can't type a structure
      DEPS?.push(reelxInstance, stateVal);

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

          for (const { _s } of subscriber._values.splice(0)) _s.delete(subscriber);

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
    reelxInstance._s.add(subscriber);

    return (): void => {
      reelxInstance._s.delete(subscriber);
      if (reelxInstance._s.size === 0) {
        for (const { _s } of subscriber._values) _s.delete(subscriber);
      }
    };
  };

  reelxInstance._s = new Set();

  return reelxInstance;
};

export function reelxDebug<S>(rlx: RlxValueState<S> | RlxComputedState<S>): {
  subs: () => Nullable<Set<Subscriber>>;
} {
  return {
    subs: (): Nullable<Set<Subscriber>> => {
      const subs: unknown = hasProperty('_s', rlx) ? rlx._s : undefined;
      return hasSome<Set<Subscriber>>(subs) ? subs : undefined;
    },
  };
}

reelx.notify = (): void => {
  const iterator = QUEUE;

  QUEUE = [];

  for (const subscribers of iterator) {
    for (const subscriber of subscribers) subscriber();
  }
};

reelx.notify.schedule = (): Promise<void> => Promise.resolve().then(reelx.notify);
