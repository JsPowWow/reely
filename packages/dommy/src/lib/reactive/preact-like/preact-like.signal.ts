import { noop, setPrototype } from '@reely/utils';

import { reelx } from '../reelx/reelx.core';

import type { Reelx, RlxState, RlxSubscribe } from '../reelx/reelx.types';

export interface Signal<T> extends RlxSubscribe<T> {
  (): T;
  get value(): T;
  set value(value: T);
}

export interface Computed<T> extends RlxSubscribe<T> {
  (): T;
  get value(): T;
}

export function signal<T>(init: T): Signal<T> {
  return setPrototype<Signal<T>>(signalProto, reelx(init));
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

export function effect(fn: VoidFunction): VoidFunction {
  const context: { dispose?: VoidFunction } = {};

  // the body runs as the computation; writes inside it are grouped, so its dependants run once
  const s = computed<void>(() => reelx.batch(fn.bind(context)));
  const dispose = s.subscribe(noop);
  context.dispose = dispose;
  return dispose;
}

const signalProto: ThisType<RlxState<unknown>> = {
  get value() {
    return this();
  },
  set value(v) {
    this(v);
  },
};

const computedProto: ThisType<Reelx> = {
  get value() {
    return this();
  },
};
