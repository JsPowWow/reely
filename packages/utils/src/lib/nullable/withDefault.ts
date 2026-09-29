import { hasSome } from '@reely/basics';

import type { Nullable } from '../types/core.types';

const useDefaultImpl = <T>(defaultValue: T, value: Nullable<T>): T => (hasSome(value) ? value : defaultValue);

/** `value`, or `defaultValue` when it is nullish. Curried when given only `defaultValue`. */
export function withDefault<T>(defaultValue: T, value: Nullable<T>): T;
export function withDefault<T>(defaultValue: T): (value: Nullable<T>) => T;

export function withDefault<T>(defaultValue: T, value?: Nullable<T>): unknown {
  return arguments.length === 1
    ? (value: Nullable<T>): T => useDefaultImpl(defaultValue, value)
    : useDefaultImpl(defaultValue, value);
}
