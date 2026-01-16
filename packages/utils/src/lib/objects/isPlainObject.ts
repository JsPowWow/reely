import { hasSome } from './hasSome';
import isObjectTypeOf from './isObjectTypeOf';

import type { KeyValueObject } from '../types/core.types';

export default function isPlainObject(source: unknown): source is KeyValueObject {
  return hasSome(source) && isObjectTypeOf('Object', source);
}

// export const isPlainObject = (val: unknown): val is Record<string, unknown> =>
//   Object.prototype.toString.call(val) === '[object Object]' &&
//   [Object.prototype, null].includes(Object.getPrototypeOf(val));
