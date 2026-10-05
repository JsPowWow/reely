import { noop, setPrototype } from '@reely/utils';

import { getOwner, Owner, withOwner } from './owner';
import * as reelx from './reelx.core';

import type { ReactiveValue, SignalOptions } from './reelx.core';

export { batch, untracked, type ReactiveValue, type SignalOptions } from './reelx.core';

export interface Signal<T> {
  (): T;
  get value(): T;
  set value(value: T);
  /** Writes `value`, as `.value =` does. */
  set(value: T): void;
  /** Writes what `fn` makes of the value, read without subscribing the running effect or computed to it. */
  update(fn: (value: T) => T): void;
  /** Reads the value without subscribing the running effect or computed to it. */
  peek(): T;
}

export interface Computed<T> {
  (): T;
  get value(): T;
  /** Reads the value without subscribing the running effect or computed to it. */
  peek(): T;
}

/** A value that effects and computeds re-read when it is written; a function is held as a value too. */
export const signal = <T>(init: T, options?: SignalOptions<T>): Signal<T> =>
  setPrototype<Signal<T>>(signalProto, reelx.signal(init, options));

/**
 * A value derived from signals, recomputed only after one of them changes. What `fn` throws is
 * rethrown on every read until then.
 */
export const computed = <T>(fn: () => T): Computed<T> => setPrototype<Computed<T>>(computedProto, reelx.computed(fn));

/**
 * Runs `fn` now and after every change of what it reads; what a run registers is released before
 * the next one. Returns `dispose`, also reachable as `this.dispose()` inside `fn`.
 */
export const effect = (fn: (this: { dispose(): void }) => void): (() => void) => {
  const parent = getOwner();
  let disposeRun: () => void = noop;
  let running = false;
  let disposed = false;
  let unsubscribe: () => void = noop;
  let body: () => void = noop;

  // cleanups read and write signals like any code outside the effect: untracked, in one batch
  const releaseRun = (): void => {
    const release = disposeRun;
    disposeRun = noop;
    reelx.untracked(() => reelx.batch(release));
  };

  const dispose = (): void => {
    if (disposed) {
      return;
    }
    disposed = true;
    Owner.drop(parent, dispose);
    // a kept `dispose` must not keep the body or the effect's last dependencies alive
    body = noop;
    unsubscribe();
    unsubscribe = noop;
    // a run that disposes its own effect releases its cleanups once it has finished
    if (!running) {
      releaseRun();
    }
  };

  // `this` in the body: a run can dispose its own effect, the first run included
  body = fn.bind({ dispose });

  const run = (): void => {
    try {
      releaseRun();
    } catch (error) {
      dispose();
      throw error;
    }
    if (disposed) {
      return;
    }
    running = true;
    try {
      withOwner((disposeOwner) => {
        disposeRun = disposeOwner;
        body();
      }, null);
    } finally {
      running = false;
      if (disposed) {
        releaseRun();
      }
    }
  };

  Owner.hold(parent, dispose);
  // what the first run triggers runs after it; an error of those effects leaves this one alive
  reelx.batch(() => {
    let release: () => void;
    try {
      release = reelx.effect(run);
    } catch (error) {
      dispose();
      throw error;
    }
    // the first run may have disposed the effect before its subscription existed
    if (disposed) {
      release();
    } else {
      unsubscribe = release;
    }
  });
  return dispose;
};

/**
 * Calls `cb` with the value of `read` now and after every change it notifies, until disposed with
 * its owner or by the returned function. `cb` runs untracked, under an owner released before the next
 * call, and what it writes reaches the subscription, unlike a write of an effect's own run.
 */
export const subscribe = <T>(read: ReactiveValue<T>, cb: (value: T) => void): (() => void) =>
  effect(() => {
    const value = read();
    reelx.outside(() => cb(value));
  });

const computedProto: ThisType<ReactiveValue<unknown>> = {
  get value(): unknown {
    return this();
  },
  peek(): unknown {
    return reelx.untracked(this);
  },
  toString(): string {
    return String(reelx.untracked(this));
  },
  valueOf(): unknown {
    return reelx.untracked(this);
  },
  toJSON(): unknown {
    return reelx.untracked(this);
  },
};

// `__proto__` in a literal, not a call, so importing the module runs no code
const signalProto: ThisType<ReactiveValue<unknown>> = {
  __proto__: computedProto,
  get value(): unknown {
    return this();
  },
  set value(value: unknown) {
    reelx.write(this, value);
  },
  set(value: unknown): void {
    reelx.write(this, value);
  },
  update(fn: (value: unknown) => unknown): void {
    reelx.write(this, fn(reelx.untracked(this)));
  },
};
