import { reelx } from './reelx.core';

import type { Reelx, RlxDerivedState, RlxState, RlxSubscribe } from './reelx.types';

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
  const s = reelx(init);
  Reflect.setPrototypeOf(s, signalProto);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return s as unknown as Signal<T>;
}

export function computed<T>(fn: () => T): Computed<T> {
  const s = reelx(fn);
  Reflect.setPrototypeOf(s, computedProto);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return s as unknown as Computed<T>;
}

const signalProto: ThisType<Reelx> = {
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
