import { hasSome } from '@reely/basics';

import type { Nullable } from '../types/core.types';

/** A new array of the non-nullish items of `list`; `[]` for a nullish `list`. */
export const toNonNullableItems = <T>(list: Nullable<Array<T>>): NonNullable<T>[] =>
  list?.concat()?.filter((c): c is NonNullable<T> => hasSome(c)) ?? [];
