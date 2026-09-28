import { hasProperty, hasSome, isNil } from '@reely/utils';

import { applyValue } from '../element.bindings';

import type { DOMElementStyles } from '../../types/attributes.types';
import type { DommyElement } from '../../types/dommy.types';

/**
 * Determines whether the given object has a `styles` attribute.
 *
 * @template T - The type of the props object to be checked.
 * @param {T} props - The object to be inspected for the presence of a `styles` property.
 * @returns {props is T & { styles: DOMElementStyles }} - A type guard indicating whether the `styles` property exists.
 */
export const hasStylesAttribute = <T>(props: T): props is T & { styles: DOMElementStyles } => {
  return hasProperty('styles', props) && hasSome(props.styles);
};

/**
 * Sets one inline style: a camelCase property (`marginTop`) or a custom property (`--flip`);
 * `null`/`undefined` removes it.
 *
 * @param {CSSStyleDeclaration} style - The inline style of an element.
 * @param {string} name - The style name.
 * @param {unknown} value - The style value.
 * @returns {void}
 */
const setStyle = (style: CSSStyleDeclaration, name: string, value: unknown): void => {
  const cssValue = isNil(value) ? '' : String(value);
  if (name.startsWith('--')) {
    style.setProperty(name, cssValue);
  } else {
    Reflect.set(style, name, cssValue);
  }
};

/**
 * Applies a set of CSS styles to a given HTML element; a signal or a getter keeps its style updated.
 *
 * @template Element Extends the HTMLElement type to ensure type safety for the provided element.
 * @param {Element} element The HTML element to which the styles will be applied.
 * @param {DOMElementStyles} styles Styles by camelCase property or `--custom` property name.
 * @returns {HTMLElement} The updated HTML element with the specified styles applied.
 */
export const setStyleAttributes = <Element extends DommyElement>(
  element: Element,
  styles: DOMElementStyles
): Element => {
  for (const [name, value] of Object.entries(styles)) {
    applyValue(value, (current) => setStyle(element.style, name, current));
  }
  return element;
};
