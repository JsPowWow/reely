import { hasSome } from '../objects/hasSome';

import type { Nullable } from '../types/core.types';
import type { MapFn } from '../types/function.types';

const useMapper =
  <T, O>(f: MapFn<T, O>) =>
  (value: Nullable<T>): Nullable<O> =>
    hasSome(value) ? f(value) ?? null : null;

export function mapNullable<T, O>(f: MapFn<T, O>, value: Nullable<T>): Nullable<O>;
export function mapNullable<T, O>(f: MapFn<T, O>): (value: Nullable<T>) => Nullable<O>;

/**
 * @description Returns mapped source value using provided `map` function
 */
export function mapNullable<T, O>(f: MapFn<T, O>, value?: Nullable<T>): unknown {
  const mapper = useMapper(f);
  if (arguments.length === 1) {
    return mapper;
  }
  return mapper(value);
}
