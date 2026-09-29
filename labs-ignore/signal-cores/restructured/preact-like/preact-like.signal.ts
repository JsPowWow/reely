import { noop, setPrototype } from '@reely/utils';

import { getOwner, withOwner } from '../owner';
import { batch, ComputedNode, nodeOf, readerOf, StateNode, subscribe, untracked } from '../reelx/reelx.core';

export { batch, untracked } from '../reelx/reelx.core';

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
  /** Calls `cb` with the value now and after every change; returns the unsubscribe. */
  subscribe(cb: (value: T, prevValue?: T) => void): VoidFunction;
}

export interface Computed<T> {
  (): T;
  get value(): T;
  /** Reads the value without subscribing the running effect or computed to it. */
  peek(): T;
  /** Calls `cb` with the value now and after every change; returns the unsubscribe. */
  subscribe(cb: (value: T, prevValue?: T) => void): VoidFunction;
}

/** A value that bindings, effects and computeds re-read when it is written; a function is held as a value too. */
export const signal = <T>(init: T): Signal<T> => setPrototype<Signal<T>>(signalProto, readerOf(new StateNode(init)));

/**
 * A value derived from signals, recomputed only after one of them changes. What `fn` throws is
 * rethrown on every read until then.
 */
export const computed = <T>(fn: () => T): Computed<T> =>
  setPrototype<Computed<T>>(computedProto, readerOf(new ComputedNode(fn)));

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
    untracked(() => batch(release));
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
  const computation = new ComputedNode<void>(() => {
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
        batch(() => {
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
    const release = subscribe(computation, noop);
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

// reads that subscribe nothing, shared by signals and computeds; the conversions are Preact's
const untrackedReads: ThisType<() => unknown> = {
  peek() {
    return untracked(this);
  },
  toString() {
    return String(untracked(this));
  },
  valueOf() {
    return untracked(this);
  },
  toJSON() {
    return untracked(this);
  },
};

const signalProto: ThisType<Signal<unknown>> = {
  ...untrackedReads,
  get value() {
    return this();
  },
  set value(value) {
    this.set(value);
  },
  set(value: unknown) {
    nodeOf<StateNode<unknown>>(this, StateNode).write(value);
  },
  update(fn: (value: unknown) => unknown) {
    this.set(fn(this.peek()));
  },
  subscribe(cb: (value: unknown, prevValue?: unknown) => void) {
    return subscribe(nodeOf<StateNode<unknown>>(this, StateNode), cb);
  },
};

const computedProto: ThisType<Computed<unknown>> = {
  ...untrackedReads,
  get value() {
    return this();
  },
  subscribe(cb: (value: unknown, prevValue?: unknown) => void) {
    return subscribe(nodeOf<ComputedNode<unknown>>(this, ComputedNode), cb);
  },
};
