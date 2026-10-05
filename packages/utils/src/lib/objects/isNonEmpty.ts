import { hasSome, isString } from '@reely/basics';

import type { Nullable } from '../types/core.types';

export const isNonEmpty = <T extends Nullable<string | readonly unknown[]>>(value: T): value is NonNullable<T> => {
  if (!hasSome(value)) {
    return false;
  }
  if (Array.isArray(value) || isString(value)) {
    return value.length > 0;
  }
  return false;
};
