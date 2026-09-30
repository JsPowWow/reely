import { hasSome, isString } from '@reely/basics';
import { isBoolean, isNil, isNumber } from '@reely/utils';

import { isEventHandlerName } from '../element.listeners';

import type { DommyElement } from '../../types/dommy.types';

/** A primitive under a name that is not an `on*` slot, so a string never becomes an inline handler. */
export const isSafeAttributeEntry = (attributeName: string, value: unknown): value is string => {
  return (
    isString(attributeName) &&
    !isEventHandlerName(attributeName) &&
    (isString(value) || isNumber(value) || isBoolean(value))
  );
};

export const setAttribute = <Element extends DommyElement>(
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

export const removeAttribute = <Element extends DommyElement>(element: Element, attributeName: string): Element => {
  if (isNil(element) || !attributeName) {
    return element;
  }
  element.removeAttribute(attributeName);

  return element;
};
