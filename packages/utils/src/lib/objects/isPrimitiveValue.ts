import { isBigInt } from './isBigInt';
import { isBoolean } from './isBoolean';
import isNumber from './isNumber';
import isString from './isString';

export const isPrimitiveValue = (value: unknown): value is string | number | bigint | boolean =>
  isString(value) || isNumber(value) || isBigInt(value) || isBoolean(value);
