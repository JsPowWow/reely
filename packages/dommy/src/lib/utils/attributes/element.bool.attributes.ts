import { hasProperty, isBoolean } from '@reely/utils';

import { removeAttribute, setAttribute } from './element.attributes';

import type { DommyElement } from '../../types/dommy.types';

// a boolean property writes its attribute the way the DOM wants it: `disabled` present or absent,
// `draggable="false"`, `translate="no"`
export const hasBooleanProperty = (element: DommyElement, property: string): boolean =>
  hasProperty(property, element) && isBoolean(element[property]);

export const setBooleanProperty = <Element extends DommyElement>(
  element: Element,
  property: string,
  value: boolean
): Element => {
  Reflect.set(element, property, value);
  return element;
};

/** A boolean attribute of a name without a property: present for `true`, absent for `false`. */
export const setBoolAttribute = <Element extends DommyElement>(
  element: Element,
  attributeName: string,
  value: boolean
): Element => (value ? setAttribute(element, attributeName, '') : removeAttribute(element, attributeName));
