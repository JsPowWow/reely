import { hasSome } from './hasSome';

import type { AnyFunction } from '../types/function.types';

export function isSomeFunction<SomeFunction extends AnyFunction>(value: unknown): value is NonNullable<SomeFunction> {
  return hasSome(value) && typeof value === 'function';
}
