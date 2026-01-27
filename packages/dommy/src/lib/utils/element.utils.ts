import type { Nil } from '@reely/utils';
import { isInstanceOf, isNil, isPrimitiveValue } from '@reely/utils';

import type { ChildDOMElement, ValidChildDOMElement } from '../types/dommy.types';

/**
 * Checks whether the given element is a falsy value in a specific context.
 *
 * This function determines if the provided element is either a `Nil` value
 * (`null` or `undefined`) or strictly equal to `false`.
 *
 * @param element The value to be checked.
 * @returns A boolean indicating whether the element is a `Nil` value or `false`.
 */
export const isFalsyElement = (element: unknown): element is Nil | false => isNil(element) || element === false;

/**
 * Determines whether the given value is a valid child DOM node.
 *
 * A valid child DOM node can either be an instance of a `Node`
 * (e.g., HTMLElement, Text, Comment, etc.) or a primitive value
 * (e.g., string, number, boolean, or null/undefined) that can
 * be used as content in a DOM structure.
 *
 * @param {unknown} child - The value to be checked for validity as a child DOM node.
 * @returns {child is ValidChildDOMElement} True if the value is a valid child DOM node; otherwise, false.
 */
export const isValidChildDOMNode = (child: unknown): child is ValidChildDOMElement =>
  isInstanceOf(Node, child) || isPrimitiveValue(child);

/**
 * Determines whether a given child node is a valid, renderable DOM element.
 *
 * This function checks if the provided child is both a valid DOM node and
 * not a "falsy" element (e.g., null, undefined, or an element that should
 * not be rendered).
 *
 * @param {unknown} child - The child node to evaluate.
 * @returns {child is ValidChildDOMElement} - True if the child is a valid
 * renderable DOM element; otherwise, false.
 */
export const isValidRenderableChildDOMNode = (child: unknown): child is ValidChildDOMElement =>
  isValidChildDOMNode(child) && !isFalsyElement(child);

/**
 * Flattens a deeply nested array of child DOM elements into a single-level array.
 *
 * @param {ChildDOMElement[]} children - An array of child DOM elements, which may contain nested arrays.
 * @returns {ChildDOMElement[]} A flattened array of child DOM elements without any nested structure.
 */
// @ts-expect-error flat + Infinity/MAX_INT (anything ... > 20 ?) issue
export const flatChildren = (children: ChildDOMElement[]): ChildDOMElement[] => children.flat(Infinity);

/**
 * Transforms an array of potential child DOM elements into an array of valid renderable child DOM elements.
 * The function flattens the input array of child elements and filters out any elements that are not valid or renderable.
 *
 * @param {ChildDOMElement[]} children - An array of potential child DOM elements to be validated and processed.
 * @returns {ValidChildDOMElement[]} An array containing only the valid and renderable child DOM elements.
 */
export const toValidChildDOMElement = (children: ChildDOMElement[]): ValidChildDOMElement[] =>
  flatChildren(children).filter(isValidRenderableChildDOMNode);
