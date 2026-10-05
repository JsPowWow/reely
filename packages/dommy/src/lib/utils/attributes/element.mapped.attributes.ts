// Only the names that differ by more than case: an HTML element lowercases the rest (`tabIndex`).
const mappedAttributes = [
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['acceptCharset', 'accept-charset'],
  ['httpEquiv', 'http-equiv'],
] as const;

const mappedAttributeNamesMap: Map<string, string> = new Map<string, string>(mappedAttributes);

export const toAttributeName = (property: string): string => mappedAttributeNamesMap.get(property) ?? property;
