import { hasSome } from '../../objects/hasSome';
import isInstanceOf from '../../objects/isInstanceOf';

import type { PipeableFunction } from '../../types/function.types';
import type { DOMNode } from '../types/hyperscript.types';

/**
 * Appends a list of DOM nodes to a given parent HTML element.
 *
 * The function takes an array of DOMNode elements and returns a pipeable
 * function that accepts an HTML element as its parent. It then appends
 * each child from the provided array to the parent element in order.
 *
 * @template Element - The type of the parent HTML element.
 * @param {DOMNode[]} children - An array of DOM nodes to be appended to the parent element.
 * @returns {PipeableFunction<Element>} A function that takes a parent HTML element, appends
 * the provided children to it, and returns the parent element.
 */
export const appendChildren =
  <Element extends HTMLElement>(children: DOMNode[]): PipeableFunction<Element> =>
  (parent) => {
    children.forEach(appendTo(parent));
    return parent;
  };

/**
 * A function that appends a DOM node or string representation to a given parent HTMLElement.
 *
 * @template Element - The type of the HTMLElement to which the child will be appended.
 * @param {Element} parent - The parent HTMLElement to which the child node will be appended.
 * @returns {PipeableFunction<DOMNode>} A function that accepts a child node or string and appends it to the parent.
 * The child can either be a valid DOM Node or a string, which will be converted and appended accordingly.
 */
export const appendTo =
  <Element extends HTMLElement>(parent: Element): PipeableFunction<DOMNode> =>
  (child) => {
    if (hasSome(child)) {
      parent.append(isInstanceOf(Node, child) ? child : String(child));
    }

    return parent;
  };
