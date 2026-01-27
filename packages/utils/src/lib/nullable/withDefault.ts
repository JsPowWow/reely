import { hasSome } from '../objects/hasSome';

import type { Nullable } from '../types/core.types';

const useDefaultImpl = <T>(defaultValue: T, value: Nullable<T>): T => (hasSome(value) ? value : defaultValue);

export function withDefault<T>(defaultValue: T, value: Nullable<T>): T;
export function withDefault<T>(defaultValue: T): (value: Nullable<T>) => T;

/**
 * @description Returns provided source value or `defaultValue` in case of `nullish` source
 */
export function withDefault<T>(defaultValue: T, value?: Nullable<T>): unknown {
  return arguments.length === 1
    ? (value: Nullable<T>): T => useDefaultImpl(defaultValue, value)
    : useDefaultImpl(defaultValue, value);
}
