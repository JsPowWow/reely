export default function toRemovedProperty<SourceObject, Property extends keyof SourceObject>(
  property: Property,
  object: SourceObject
): Omit<SourceObject, Property> {
  const { [property]: _ignored, ...rest } = object;
  return rest;
}
