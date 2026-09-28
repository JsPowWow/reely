import type { Nil } from '@reely/utils';
import { isInstanceOf, isNil, isPrimitiveValue, isSomeFunction } from '@reely/utils';

import type { ValidChildDOMElement } from '../types/dommy.types';

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
 * (e.g., HTMLElement, Text, Comment, etc.), a primitive value
 * (e.g., string, number, boolean, or null/undefined) that can
 * be used as content in a DOM structure, or a reactive value (a signal or a getter).
 *
 * @param {unknown} child - The value to be checked for validity as a child DOM node.
 * @returns {child is ValidChildDOMElement} True if the value is a valid child DOM node; otherwise, false.
 */
export const isValidChildDOMNode = (child: unknown): child is ValidChildDOMElement =>
  isInstanceOf(Node, child) || isPrimitiveValue(child) || isSomeFunction(child);

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
 * Flattens nested children and keeps only the ones that render: nodes, primitives other than
 * `null`/`undefined`/`false`, and reactive values. Children arrive untyped from JSX, so this
 * checks them at runtime.
 *
 * @param {readonly unknown[]} children - Children, possibly nested in arrays.
 * @returns {ValidChildDOMElement[]} A flat list of the children to render.
 */
export const toValidChildDOMElement = (children: readonly unknown[]): ValidChildDOMElement[] =>
  children.flat(Infinity).filter(isValidRenderableChildDOMNode);
