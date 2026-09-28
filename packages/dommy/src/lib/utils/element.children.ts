import type { PipeableFn } from '@reely/utils';
import { hasProperty, isNonEmpty } from '@reely/utils';

import { toChildNode } from './element.bindings';
import { toValidChildDOMElement } from './element.utils';

import type { ChildDOMElement, ValidChildDOMElement } from '../types/dommy.types';

/**
 * Appends already validated children to a parent element.
 *
 * @template Element - The type of the parent HTML element.
 * @param {ValidChildDOMElement[]} children - Children to append, in order.
 * @returns {PipeableFn<Element>} A step that appends the children and returns the parent.
 */
export const appendChildren =
  <Element extends HTMLElement>(children: ValidChildDOMElement[]): PipeableFn<Element> =>
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
  <Element extends HTMLElement>(parent: Element): ((child: ChildDOMElement) => Element) =>
  (child) =>
    appendChildren<Element>(toValidChildDOMElement([child]))(parent);

/**
 * Replaces all children of a parent element; accepts the same children as `appendTo`.
 *
 * @template Element - The type of the parent HTML element.
 * @param {Element} parent - The parent element.
 * @returns {(...children: ChildDOMElement[]) => Element} A function that replaces the children and returns the parent.
 */
export const replaceChildrenOf =
  <Element extends HTMLElement>(parent: Element): ((...children: ChildDOMElement[]) => Element) =>
  (...children) => {
    parent.replaceChildren(...toValidChildDOMElement(children).map(toChildNode));
    return parent;
  };

/**
 * Picks the children to render: the argument children when there are any, otherwise
 * `props.children`. Props arrive untyped from JSX, so they are checked at runtime.
 *
 * @param {unknown} props - The props object, if any.
 * @param {readonly unknown[]} children - The argument children.
 * @returns {ValidChildDOMElement[]} The children to render.
 */
export const toElementChildren = (props: unknown, children: readonly unknown[]): ValidChildDOMElement[] => {
  const elementChildren = toValidChildDOMElement(children);
  if (isNonEmpty(elementChildren) || !hasProperty('children', props)) {
    return elementChildren;
  }
  return toValidChildDOMElement([props.children]);
};
