import { setPrototype } from '@reely/utils';

import { reelx } from '../reelx/reelx.core';

import type { Reelx, RlxDerivedState, RlxState, RlxSubscribe } from '../reelx/reelx.types';

export interface Signal<T> extends RlxSubscribe<T> {
  (initial: T): RlxState<T>;
  (initial?: T): RlxState<T>;
  get value(): T;
  set value(value: T);
  // peek(): T;
}

export interface Computed<T> extends RlxSubscribe<T> {
  (fn: () => T, equal?: (prev: T, next: T) => boolean): RlxDerivedState<T>;
  get value(): T;
  // peek(): T;
}

export function signal<T>(init: T): Signal<T> {
  return setPrototype<Signal<T>>(signalProto, reelx(init));
}

export function computed<T>(fn: () => T): Computed<T> {
  return setPrototype<Computed<T>>(computedProto, reelx(fn));
}

export function effect(fn: VoidFunction): VoidFunction {
  const context: { dispose?: VoidFunction } = {};
  // let cleanup: VoidFunction | undefined;

  const effectFn = fn.bind(context);
  // let effectFn = function (): ReturnType<typeof fn> {
  //   if (isSomeFunction(cleanup)) {
  //     cleanup();
  //   }
  //   const result = fn();
  //   if (isSomeFunction(result)) {
  //     cleanup = result;
  //   }
  //   return result;
  // };
  // effectFn = effectFn.bind(context);

  const s = computed<void>(() => {
    effectFn();
  });
  const dispose = s.subscribe(effectFn);
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
