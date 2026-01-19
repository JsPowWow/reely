import { hasSome } from './hasSome';

import type { AnyFunction } from '../types/function.types';

/**
 * @description Checks if provided value can be classified as a callable `function`
 */
export function isSomeFunction<SomeFunction extends AnyFunction>(value: unknown): value is NonNullable<SomeFunction> {
  return hasSome(value) && typeof value === 'function';
}
