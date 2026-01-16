import { hasSome } from '../../../objects/hasSome';

const mappedAttributes = [
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['readOnly', 'readonly'],
  ['maxLength', 'maxlength'],
  ['minLength', 'minlength'],
  ['tabIndex', 'tabindex'],
  ['autoComplete', 'autocomplete'],
  ['colSpan', 'colspan'],
  ['rowSpan', 'rowspan'],
  ['formNoValidate', 'formnovalidate'],

  ['formAction', 'formaction'],
  ['formEncType', 'formenctype'],
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

  ['autoFocus', 'autofocus'],

  ['viewBox', 'viewBox'],
  ['preserveAspectRatio', 'preserveAspectRatio'],
] as const;

const mappedAttributeNamesMap: Map<string, string> = new Map<string, string>(mappedAttributes);

export const isMappedAttribute = (attributeName: string): boolean =>
  hasSome(attributeName) && mappedAttributeNamesMap.has(attributeName);

export const setMappedAttribute = <Element extends HTMLElement>(
  element: Element,
  attributeName: string,
  value: string
): Element => {
  if (hasSome(attributeName)) {
    const attrName = mappedAttributeNamesMap.get(attributeName) ?? attributeName;
    element.setAttribute(attrName, String(value));
  }
  return element;
};
