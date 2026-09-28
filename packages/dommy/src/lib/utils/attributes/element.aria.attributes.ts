import { hasProperty, hasSome, isNil } from '@reely/utils';

import { applyValue } from '../element.bindings';
import { removeAttribute, setAttribute } from './element.attributes';

import type { DOMElementAria } from '../../types/attributes.types';

/**
 * Determines if the given props object contains an `aria` object with at least one entry.
 *
 * @template T - The type of the props object being checked.
 * @param {T} props - The object to validate for the presence of the `aria` attribute.
 * @returns {boolean} True if the `props` object has an `aria` object.
 */
export const hasAriaAttribute = <T>(props: T): props is T & { aria: DOMElementAria } => {
  return hasProperty('aria', props) && hasSome(props.aria);
};

/**
 * Converts an `ARIAMixin` property name to its attribute: `ariaCurrent` → `aria-current`, `role` stays.
 *
 * @param {string} property - The `ARIAMixin` property name.
 * @returns {string} The attribute name.
 */
const toAriaAttributeName = (property: string): string =>
  property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Renders ARIA props as `role` and `aria-*` attributes; a signal or a getter keeps an attribute
 * updated, and `null`/`undefined` removes it. Attributes, unlike ARIA reflection, work everywhere.
 *
 * @template Element - The type of the HTML element being modified.
 * @param {Element} element - The target HTML element.
 * @param {DOMElementAria} aria - ARIA values by `ARIAMixin` property name.
 * @returns {Element} The same element.
 */
export const setAriaAttributes = <Element extends HTMLElement>(element: Element, aria: DOMElementAria): Element => {
  for (const [property, value] of Object.entries(aria)) {
    const attributeName = toAriaAttributeName(property);
    applyValue(value, (current) =>
      isNil(current) ? removeAttribute(element, attributeName) : setAttribute(element, attributeName, String(current))
    );
  }
  return element;
};
