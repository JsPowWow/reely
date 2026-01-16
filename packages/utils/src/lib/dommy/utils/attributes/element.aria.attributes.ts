import hasProperty from '../../../objects/hasProperty';
import { hasSome } from '../../../objects/hasSome';

/**
 * Determines if the given props object contains a valid `aria` attribute.
 *
 * This type guard checks whether the `props` object includes an `aria` property
 * and whether that property fulfills the conditions defined by `ARIAMixin`.
 * The `aria` attribute should be a partial implementation of `ARIAMixin` and
 * must contain at least one property to satisfy the guard.
 *
 * @template T - The type of the props object being checked.
 * @param {T} props - The object to validate for the presence of the `aria` attribute.
 * @returns {boolean} True if the `props` object has an `aria` attribute that adheres
 * to the expected structure, otherwise false.
 */
export const hasAriaAttribute = <T>(props: T): props is T & { aria: Partial<ARIAMixin> } => {
  return hasProperty('aria', props) && hasSome(props.aria);
};

/**
 * Assigns ARIA attributes to a given HTML element and returns the modified element.
 *
 * @template Element - The type of the HTML element being modified.
 * @param {Element} element - The target HTML element to which ARIA attributes will be assigned.
 * @param {Partial<ARIAMixin>} aria - An object containing ARIA attributes to be applied to the element.
 * @returns {Element} - The modified HTML element with the assigned ARIA attributes.
 */
export const setAriaAttributes = <Element extends HTMLElement>(element: Element, aria: Partial<ARIAMixin>): Element => {
  Object.assign(element, { ...aria });
  return element;
};
