import { hasSome } from './hasSome';
import isValidRecordKey from './isValidRecordKey';

export default function hasProperty<Property extends PropertyKey, Source>(
  property: Property,
  source: Source
): source is Source & { [Key in Property]: unknown } {
  return isValidRecordKey(property) && typeof source === 'object' && hasSome(source) && property in source;
}
