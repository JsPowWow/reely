import type { Truthy } from '../types/core.types';

/**
 * Whether `value` is truthy (not `false`, `0`, `-0`, `0n`, `''`, `NaN`, `null` or `undefined`),
 * narrowing those away. Only the true branch is exact: a falsy `string` or `number` is still a
 * `string` or `number`, so do not rely on the narrowing after `!isTruthy(value)`.
 */
export function isTruthy<T>(value: T): value is Truthy<T> {
  return Boolean(value);
}
