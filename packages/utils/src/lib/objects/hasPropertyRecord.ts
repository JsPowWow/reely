import { hasSome } from './hasSome';
import isValidRecordKey from './isValidRecordKey';

import type { KeyValueObject } from '../types/core.types';

export function hasPropertyRecord<Source extends KeyValueObject>(
  property: unknown,
  source: Source
): property is keyof Source {
  return isValidRecordKey(property) && typeof source === 'object' && hasSome(source) && property in source;
}
