const mappedAttributes = [
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['readOnly', 'readonly'],
  ['maxLength', 'maxlength'],
  ['minLength', 'minlength'],
  ['tabIndex', 'tabindex'],
  ['colSpan', 'colspan'],
  ['rowSpan', 'rowspan'],
  ['formNoValidate', 'formnovalidate'],

  ['formAction', 'formaction'],
  ['formMethod', 'formmethod'],
  ['formTarget', 'formtarget'],
  ['acceptCharset', 'accept-charset'],

  ['crossOrigin', 'crossorigin'],
  ['dateTime', 'datetime'],
  ['useMap', 'usemap'],

  ['cellPadding', 'cellpadding'],
  ['cellSpacing', 'cellspacing'],
  ['bgColor', 'bgcolor'],

  ['httpEquiv', 'http-equiv'],

  ['viewBox', 'viewBox'],
  ['preserveAspectRatio', 'preserveAspectRatio'],
] as const;

const mappedAttributeNamesMap: Map<string, string> = new Map<string, string>(mappedAttributes);

/**
 * Converts a DOM property name to its attribute name: `className` → `class`; other names stay.
 *
 * @param {string} property - The prop name.
 * @returns {string} The attribute name.
 */
export const toAttributeName = (property: string): string => mappedAttributeNamesMap.get(property) ?? property;
