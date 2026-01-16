import { hasSome } from './hasSome';

import type { Nullable } from '../types/core.types';

/**
 * A utility function that takes an optional array (`list`) of potentially nullable items
 * and returns a new array containing only the non-nullable items from the input array.
 *
 * @template T - The type of the items in the input array.
 * @param {Nullable<Array<T>>} list - The input list which can be null, undefined, or an array of items of type T.
 * @returns {NonNullable<T>[]} A new array containing only the non-nullable items from the input list.
 */
export const toNonNullableItems = <T>(list: Nullable<Array<T>>): NonNullable<T>[] =>
  list?.concat()?.filter((c): c is NonNullable<T> => hasSome(c)) ?? [];
