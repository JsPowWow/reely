import { isNil } from '@reely/utils';

import { isSafeAttributeEntry, removeAttribute, setAttribute } from './element.attributes';
import { getDommyLogger } from '../../config';

/**
 * Applies one static prop of an SVG element. SVG has no writable properties for its attributes,
 * so every value is an attribute under the name it is written with (`viewBox`, `stroke-width`);
 * only `className` maps to `class`. A `null`/`undefined` removes the attribute.
 *
 * @template Element - The type of the SVG element.
 * @param {Element} element - The target element.
 * @param {string} property - The prop name.
 * @param {unknown} value - The prop value.
 * @returns {Element} The same element.
 */
export const assignSvgAttribute = <Element extends SVGElement>(
  element: Element,
  property: string,
  value: unknown
): Element => {
  const attributeName = property === 'className' ? 'class' : property;
  if (isNil(value)) {
    return removeAttribute(element, attributeName);
  }
  if (isSafeAttributeEntry(attributeName, value)) {
    return setAttribute(element, attributeName, String(value));
  }
  getDommyLogger()?.warn(`The SVG attribute was not assigned: `, property, value);
  return element;
};
