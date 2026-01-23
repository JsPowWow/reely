import { setPrototype } from '@reely/utils';

import { reelx } from '../reelx/reelx.core';

import type { Reelx, RlxDerivedState, RlxState, RlxSubscribe } from '../reelx/reelx.types';

export interface Signal<T> extends RlxSubscribe<T> {
  (initial: T): RlxState<T>;
  (initial?: T): RlxState<T>;
  get value(): T;
  set value(value: T);
}

export interface Computed<T> extends RlxSubscribe<T> {
  (fn: () => T, equal?: (prev: T, next: T) => boolean): RlxDerivedState<T>;
  get value(): T;
}

export function signal<T>(init: T): Signal<T> {
  return setPrototype<Signal<T>>(signalProto, reelx(init));
}

export function computed<T>(fn: () => T): Computed<T> {
  return setPrototype<Computed<T>>(computedProto, reelx(fn));
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
