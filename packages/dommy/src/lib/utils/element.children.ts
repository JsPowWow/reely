import type { PipeableFn } from '@reely/utils';
import { hasProperty, isInstanceOf, isNonEmpty, isString } from '@reely/utils';

import { toChildNode } from './element.bindings';
import { toValidChildDOMElement } from './element.utils';

import type { ChildDOMElement, ValidChildDOMElement, DommyElement } from '../types/dommy.types';

/**
 * Appends already validated children to a parent element.
 *
 * @template Element - The type of the parent HTML element.
 * @param {ValidChildDOMElement[]} children - Children to append, in order.
 * @returns {PipeableFn<Element>} A step that appends the children and returns the parent.
 */
export const appendChildren =
  <Element extends DommyElement>(children: ValidChildDOMElement[]): PipeableFn<Element> =>
  (parent) => {
    parent.append(...children.map(toChildNode));
    return parent;
  };

/**
 * Appends a child to a parent element: a node, a primitive, a reactive value, or nested arrays
 * of them, as JSX produces; `null`, `undefined` and `false` render nothing.
 *
 * @template Element - The type of the parent HTML element.
 * @param {Element} parent - The parent element.
 * @returns {(child: ChildDOMElement) => Element} A function that appends a child and returns the parent.
 */
export const appendTo =
  <Element extends DommyElement>(parent: Element): ((child: ChildDOMElement) => Element) =>
  (child) => {
    parent.append(...toChildNodes([child]));
    return parent;
  };

/**
 * Replaces all children of a parent element; accepts the same children as `appendTo`.
 *
 * @template Element - The type of the parent HTML element.
 * @param {Element} parent - The parent element.
 * @returns {(...children: ChildDOMElement[]) => Element} A function that replaces the children and returns the parent.
 */
export const replaceChildrenOf =
  <Element extends DommyElement>(parent: Element): ((...children: ChildDOMElement[]) => Element) =>
  (...children) => {
    parent.replaceChildren(...toChildNodes(children));
    return parent;
  };

/**
 * Converts untyped children to nodes to insert: flattens arrays, drops `null`/`undefined`/`false`,
 * binds reactive values to text nodes.
 *
 * @param {readonly unknown[]} maybeChildren - Children, possibly nested in arrays.
 * @returns {(Node | string)[]} Nodes and texts for `append`/`replaceChildren`.
 */
export const toChildNodes = (maybeChildren: readonly unknown[]): (Node | string)[] =>
  toValidChildDOMElement(maybeChildren).map(toChildNode);

/**
 * Converts anything renderable to the nodes it puts into a parent: a fragment gives its
 * children and a string a text node, so each node can later be moved or removed on its own.
 *
 * @param {unknown} maybeChild - A child, possibly an array of children.
 * @returns {Node[]} The nodes, in order.
 */
export const toNodes = (maybeChild: unknown): Node[] =>
  toChildNodes([maybeChild]).flatMap((child) => {
    if (isString(child)) {
      return [document.createTextNode(child)];
    }
    return isInstanceOf(DocumentFragment, child) ? Array.from(child.childNodes) : [child];
  });

/**
 * Picks the children to render: the argument children when there are any, otherwise
 * `props.children`. Props arrive untyped from JSX, so they are checked at runtime.
 *
 * @param {unknown} maybeProps - The props object, if any.
 * @param {readonly unknown[]} maybeChildren - The argument children.
 * @returns {ValidChildDOMElement[]} The children to render.
 */
export const toElementChildren = (maybeProps: unknown, maybeChildren: readonly unknown[]): ValidChildDOMElement[] => {
  const elementChildren = toValidChildDOMElement(maybeChildren);
  if (isNonEmpty(elementChildren) || !hasProperty('children', maybeProps)) {
    return elementChildren;
  }
  return toValidChildDOMElement([maybeProps.children]);
};
