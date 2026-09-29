import { noop, setPrototype } from '@reely/utils';

import { getOwner, withOwner } from '../owner';
import { reelx } from '../reelx/reelx.core';

import type { RlxDerivedState, RlxState, RlxSubscribe } from '../reelx/reelx.types';

export interface Signal<T> extends RlxSubscribe<T> {
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

export interface Computed<T> extends RlxSubscribe<T> {
  (): T;
  get value(): T;
  /** Reads the value without subscribing the running effect or computed to it. */
  peek(): T;
}

/** A value that bindings, effects and computeds re-read when it is written; a function is held as a value too. */
export const signal = <T>(init: T): Signal<T> => setPrototype<Signal<T>>(signalProto, reelx.state(init));

/**
 * A value derived from signals, recomputed only after one of them changes. What `fn` throws is
 * rethrown on every read until then.
 */
export const computed = <T>(fn: () => T): Computed<T> => setPrototype<Computed<T>>(computedProto, reelx(fn));

/** Groups writes: effects and bindings run once, when the outermost `batch` ends. */
export const batch = <T>(fn: () => T): T => reelx.batch(fn);

/** Runs `fn` without subscribing the running effect or computed to the signals it reads. */
export const untracked = <T>(fn: () => T): T => reelx.untracked(fn);

/**
 * Runs `fn` now and after every change of what it reads; what a run registers is released before
 * the next one. Returns `dispose`, also reachable as `this.dispose()` inside `fn`.
 */
export const effect = (fn: VoidFunction): VoidFunction => {
  const parent = getOwner();
  let disposeRun: VoidFunction = noop;
  let running = false;
  let disposed = false;
  let unsubscribe: VoidFunction = noop;
  let body: VoidFunction = noop;
  let created = false;

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
    parent?.cleanups.delete(dispose);
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

  // the body runs as the computation; writes inside it are grouped, so its dependants run once
  const s = computed<void>(() => {
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
        reelx.batch(() => {
          try {
            body();
          } catch (error) {
            // a first run that throws disposes it before the flush that ends the batch
            if (!created) {
              dispose();
            }
            throw error;
          }
        });
      }, null);
    } finally {
      running = false;
      if (disposed) {
        releaseRun();
      }
    }
  });
  parent?.cleanups.add(dispose);
  try {
    const release = s.subscribe(noop);
    // the first run may have disposed the effect before its subscription existed
    if (disposed) {
      release();
    } else {
      unsubscribe = release;
    }
    created = true;
  } catch (error) {
    dispose();
    throw error;
  }
  return dispose;
};

const signalProto: ThisType<RlxState<unknown>> = {
  get value() {
    return this();
  },
  peek() {
    return reelx.untracked(this);
  },
  set value(v) {
    this(v);
  },
  set(value: unknown) {
    this(value);
  },
  update(fn: (value: unknown) => unknown) {
    this(fn(reelx.untracked(this)));
  },
};

const computedProto: ThisType<RlxDerivedState<unknown>> = {
  get value() {
    return this();
  },
  peek() {
    return reelx.untracked(this);
  },
};
