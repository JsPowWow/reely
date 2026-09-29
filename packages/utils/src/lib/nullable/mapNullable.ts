import { hasSome } from '@reely/basics';

import type { Nullable } from '../types/core.types';
import type { MapFn } from '../types/function.types';

const useMapper =
  <T, O>(f: MapFn<T, O>) =>
  (value: Nullable<T>): Nullable<O> =>
    hasSome(value) ? f(value) ?? null : null;

/** Maps a non-nullish value; a nullish value or result gives `null`. Curried when given only `f`. */
export function mapNullable<T, O>(f: MapFn<T, O>, value: Nullable<T>): Nullable<O>;
export function mapNullable<T, O>(f: MapFn<T, O>): (value: Nullable<T>) => Nullable<O>;

export function mapNullable<T, O>(f: MapFn<T, O>, value?: Nullable<T>): unknown {
  const mapper = useMapper(f);
  if (arguments.length === 1) {
    return mapper;
  }
  return mapper(value);
}
