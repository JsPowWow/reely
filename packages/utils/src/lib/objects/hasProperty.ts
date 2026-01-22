import { hasSome } from './hasSome';
import { isSomeFunction } from './isSomeFunction';
import isValidRecordKey from './isValidRecordKey';

export function hasProperty<Property extends PropertyKey, Source>(
  property: Property,
  source: Source
): source is Source & { [Key in Property]: unknown } {
  return (
    isValidRecordKey(property) &&
    (typeof source === 'object' || isSomeFunction(source)) &&
    hasSome(source) &&
    property in source
  );
}
