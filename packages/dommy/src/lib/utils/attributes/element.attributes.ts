import { hasSome, isBoolean, isNil, isNumber, isString } from '@reely/utils';

import { isEventHandlerName } from '../element.addListeners';

/**
 * Checks whether a prop can be rendered as an attribute: a primitive value under a name
 * that is not an `on*` handler slot, so a string never becomes an inline handler.
 *
 * @param {string} attributeName - The attribute name.
 * @param {unknown} value - The prop value.
 * @returns {boolean} True when the value may be written with `setAttribute`.
 */
export const isSafeAttributeEntry = (attributeName: string, value: unknown): value is string => {
  return (
    isString(attributeName) &&
    !isEventHandlerName(attributeName) &&
    (isString(value) || isNumber(value) || isBoolean(value))
  );
};

export const setAttribute = <Element extends HTMLElement>(
  element: Element,
  attributeName: string,
  value: string
): Element => {
  if (isNil(element) || !attributeName) {
    return element;
  }

  if (hasSome(value)) {
    element.setAttribute(attributeName, value);
  } else {
    removeAttribute(element, attributeName);
  }
  return element;
};

export const removeAttribute = <Element extends HTMLElement>(element: Element, attributeName: string): Element => {
  if (isNil(element) || !attributeName) {
    return element;
  }
  element.removeAttribute(attributeName);

  return element;
};
