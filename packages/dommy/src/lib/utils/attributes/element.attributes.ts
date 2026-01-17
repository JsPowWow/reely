import { hasSome, isBoolean, isNil, isNumber, isString } from '@reely/utils';

export const isSafeAttributeEntry = (attributeName: string, value: unknown): value is string => {
  return isString(attributeName) && (isString(value) || isNumber(value) || isBoolean(value));
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
