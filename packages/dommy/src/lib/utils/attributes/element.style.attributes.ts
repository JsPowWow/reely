import { hasProperty, hasSome } from '@reely/utils';

/**
 * Determines whether the given object has a `styles` attribute that is a partial implementation of `CSSStyleDeclaration`.
 *
 * @template T - The type of the props object to be checked.
 * @param {T} props - The object to be inspected for the presence of a `styles` property.
 * @returns {props is T & { styles: Partial<CSSStyleDeclaration> }} - A type guard indicating whether the `styles` property
 * exists and satisfies the condition of being a partial `CSSStyleDeclaration`.
 */
export const hasStylesAttribute = <T>(props: T): props is T & { styles: Partial<CSSStyleDeclaration> } => {
  return hasProperty('styles', props) && hasSome(props.styles);
};

/**
 * Applies a set of CSS styles to a given HTML element.
 *
 * @template Element Extends the HTMLElement type to ensure type safety for the provided element.
 * @param {Element} element The HTML element to which the styles will be applied.
 * @param {Partial<CSSStyleDeclaration>} styles An object representing the CSS styles to apply. Each key corresponds to a valid CSS property name (camelCase format), and the value specifies the style for that property.
 * @returns {HTMLElement} The updated HTML element with the specified styles applied.
 */
export const setStyleAttributes = <Element extends HTMLElement>(
  element: Element,
  styles: Partial<CSSStyleDeclaration>
): Element => {
  Object.assign(element.style, { ...styles });
  return element;
};
