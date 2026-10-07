import { isBoolean, isString } from '@reely/basics';
import { isNumber } from '@reely/utils';

import { isEventHandlerName } from '../element.listeners';

import type { DommyElement } from '../../types/dommy.types';

/** A primitive under a name that is not an `on*` slot, so a string never becomes an inline handler. */
export const isSafeAttributeEntry = (attributeName: string, value: unknown): value is string | number | boolean =>
  !isEventHandlerName(attributeName) && (isString(value) || isNumber(value) || isBoolean(value));

export const setAttribute = <Element extends DommyElement>(
  element: Element,
  attributeName: string,
  value: string
): Element => {
  element.setAttribute(attributeName, value);
  return element;
};

export const removeAttribute = <Element extends DommyElement>(element: Element, attributeName: string): Element => {
  element.removeAttribute(attributeName);
  return element;
};
