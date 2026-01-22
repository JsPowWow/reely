import { isSomeFunction } from '@reely/utils';

interface Subscriber {
  (): void;
  _v: Array<StateValue>;
}

export interface StateValue<T = unknown> {
  (newState?: T): T;
  _s: Set<Subscriber>;
  subscribe(cb: (value: T, prevValue?: T) => void): VoidFunction;
}
export interface ComputedState<T = unknown> {
  (): T;
  _s: Set<Subscriber>;
  subscribe(cb: (state: T, prevState?: T) => void): VoidFunction;
}

export type Reelx<T = unknown> = StateValue<T> | ComputedState<T>;

type Dependencies = [] | [Reelx, unknown];

/** subscribers from all touched signals */
let QUEUE: Array<Set<Subscriber>> = [];

/** global queue cache flag */
let QUEUE_VERSION = 0;

/** current subscriber during invalidation */
let SUBSCRIBER: null | Subscriber = null;

/** global subscriber pull cache flag */
let SUBSCRIBER_VERSION = 0;

/** stack-based parent ref to silently link nodes */
let DEPS: null | Dependencies = null;

export const reelx: {
  <S>(computed: () => S, equal?: (prev: S, next: S) => boolean): ComputedState<S>;
  <S>(initState: S): StateValue<S>;
  notify: {
    (): void;
    schedule?: null | VoidFunction;
  };
} = <T>(init: (() => T) | T, equal?: (prev: T, next: T) => boolean) => {
  let queueVersion = -1;
  let subscriberVersion = -1;
  let stateVal: T;
  let theReelx: StateValue<T> & ComputedState<T>;

  if (isSomeFunction(init)) {
    const deps: Dependencies = [];
    // @ts-expect-error expected properties declared below
    theReelx = (): unknown => {
      if (subscriberVersion !== SUBSCRIBER_VERSION) {
        if (queueVersion === QUEUE_VERSION && SUBSCRIBER !== null && theReelx._s.size !== 0) {
          for (const s of theReelx._s) {
            for (const { _s } of s._v) if (_s.size !== _s.add(SUBSCRIBER).size) SUBSCRIBER._v.push(theReelx);
            break;
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
      DEPS?.push(theReelx, stateVal);

      return stateVal;
    };
  } else {
    stateVal = init;
    // @ts-expect-error expected properties declared below
    theReelx = (newState: T): unknown => {
      if (newState !== undefined && !Object.is(newState, stateVal)) {
        // mark all computed(s) dirty
        ++SUBSCRIBER_VERSION;

        stateVal = newState;

        if (QUEUE.push(theReelx._s) === 1) {
          QUEUE_VERSION++;
          reelx.notify.schedule?.();
        }

        theReelx._s = new Set();
      }

      if (SUBSCRIBER !== null && theReelx._s.size !== theReelx._s.add(SUBSCRIBER).size) {
        SUBSCRIBER._v.push(theReelx);
      }

      // @ts-expect-error can't type a structure
      DEPS?.push(theReelx, stateVal);

      return stateVal;
    };
  }

  theReelx.subscribe = (cb) => {
    let queueVersion = -1;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    let lastState: T = {} as T;
    let prevState: T | undefined;

    const subscriber: Subscriber = () => {
      if (queueVersion !== QUEUE_VERSION) {
        try {
          queueVersion = QUEUE_VERSION;

          for (const { _s } of subscriber._v.splice(0)) _s.delete(subscriber);

          SUBSCRIBER = subscriber;

          SUBSCRIBER_VERSION++;

          if (theReelx() !== lastState) {
            cb((lastState = stateVal), prevState);
            prevState = stateVal;
          }
        } finally {
          SUBSCRIBER = null;
        }
      }
    };
    subscriber._v = [];

    subscriber();
    theReelx._s.add(subscriber);

    return (): void => {
      theReelx._s.delete(subscriber);
      if (theReelx._s.size === 0) {
        for (const { _s } of subscriber._v) _s.delete(subscriber);
      }
    };
  };

  theReelx._s = new Set();

  return theReelx;
};

reelx.notify = (): void => {
  const iterator = QUEUE;

  QUEUE = [];

  for (const subscribers of iterator) {
    for (const subscriber of subscribers) subscriber();
  }
};

reelx.notify.schedule = (): Promise<void> => Promise.resolve().then(reelx.notify);
