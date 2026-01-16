import { hasSome } from './hasSome';

import type { VariadicFunction } from '../types/function.types';

/**
 * @description Checks if provided value can be classified as a callable `function`
 */
export function isSomeFunction<SomeFunction extends VariadicFunction>(
  value: unknown
): value is NonNullable<SomeFunction> {
  return hasSome(value) && typeof value === 'function';
}
