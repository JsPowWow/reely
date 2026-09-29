import isObjectTypeOf from './isObjectTypeOf';

import type { KeyValueObject } from '../types/core.types';

/** Whether `value` is an object of keys and values: a literal or a class instance, not an array or a built-in. */
export function isKeyValueObject(value: unknown): value is KeyValueObject {
  return isObjectTypeOf('Object', value);
}
