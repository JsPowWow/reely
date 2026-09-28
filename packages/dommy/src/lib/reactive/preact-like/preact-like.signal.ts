import { noop, setPrototype } from '@reely/utils';

import { onCleanup, withOwner } from '../owner';
import { reelx } from '../reelx/reelx.core';

import type { RlxDerivedState, RlxState, RlxSubscribe } from '../reelx/reelx.types';

export interface Signal<T> extends RlxSubscribe<T> {
  (): T;
  get value(): T;
  set value(value: T);
  /** Reads the value without subscribing the running effect or computed to it. */
  peek(): T;
}

export interface Computed<T> extends RlxSubscribe<T> {
  (): T;
  get value(): T;
  /** Reads the value without subscribing the running effect or computed to it. */
  peek(): T;
}

export function signal<T>(init: T): Signal<T> {
  return setPrototype<Signal<T>>(signalProto, reelx.state(init));
}

export function computed<T>(fn: () => T): Computed<T> {
  return setPrototype<Computed<T>>(computedProto, reelx(fn));
}

/**
 * Groups writes: effects and bindings run once, when the outermost `batch` ends.
 *
 * @template T - The callback result type.
 * @param {() => T} fn - The callback that writes signals.
 * @returns {T} The callback result.
 */
export const batch = <T>(fn: () => T): T => reelx.batch(fn);

/**
 * Runs `fn` without subscribing the running effect or computed to the signals it reads.
 *
 * @template T - The callback result type.
 * @param {() => T} fn - Reads signals.
 * @returns {T} The callback result.
 */
export const untracked = <T>(fn: () => T): T => reelx.untracked(fn);

/**
 * Runs `fn` now and again after every change of the signals it reads. Each run has its own
 * owner: `onCleanup` inside `fn` and the effects and bindings `fn` creates are released before
 * the next run and when the effect is disposed.
 *
 * @param {VoidFunction} fn - The effect body.
 * @returns {VoidFunction} Disposes the effect; it is also disposed with the owner it was created in.
 */
export function effect(fn: VoidFunction): VoidFunction {
  let disposeRun: VoidFunction = noop;
  let running = false;
  let disposed = false;
  let unsubscribe: VoidFunction = noop;
  let body: VoidFunction = noop;

  // cleanups read and write signals like any code outside the effect: untracked, in one batch
  const releaseRun = (): void => {
    const release = disposeRun;
    disposeRun = noop;
    reelx.untracked(() => reelx.batch(release));
  };

  const dispose = (): void => {
    disposed = true;
    // a kept `dispose` must not keep the body or the effect's last dependencies alive
    body = noop;
    const release = unsubscribe;
    unsubscribe = noop;
    release();
    // a run that disposes its own effect releases its cleanups once it has finished
    if (!running) {
      releaseRun();
    }
  };

  // `this` in the body: a run can dispose its own effect, the first run included
  body = fn.bind({ dispose });

  // the body runs as the computation; writes inside it are grouped, so its dependants run once
  const s = computed<void>(() => {
    releaseRun();
    if (disposed) {
      return;
    }
    running = true;
    try {
      withOwner((disposeOwner) => {
        disposeRun = disposeOwner;
        reelx.batch(body);
      }, null);
    } finally {
      running = false;
      if (disposed) {
        releaseRun();
      }
    }
  });
  unsubscribe = s.subscribe(noop);
  // the first run disposed the effect before its subscription existed
  if (disposed) {
    dispose();
  }
  onCleanup(dispose);
  return dispose;
}

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
};

const computedProto: ThisType<RlxDerivedState<unknown>> = {
  get value() {
    return this();
  },
  peek() {
    return reelx.untracked(this);
  },
};
