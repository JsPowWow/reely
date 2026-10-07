import { isBoolean, isString } from '@reely/basics';

import { isBigInt } from './isBigInt';
import isNumber from './isNumber';

export const isPrimitiveValue = (value: unknown): value is string | number | bigint | boolean =>
  isString(value) || isNumber(value) || isBigInt(value) || isBoolean(value);
