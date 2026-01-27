import type { Nullable, PipeableFn } from '@reely/utils';
import { isInstanceOf, isNonEmpty } from '@reely/utils';

import {
  isFalsyElement,
  isValidChildDOMNode,
  isValidRenderableChildDOMNode,
  toValidChildDOMElement,
} from './element.utils';

import type {
  ChildDOMElement,
  DOMElementFactoryProps,
  HtmlElementTag,
  ValidChildDOMElement,
} from '../types/dommy.types';

/**
 * Appends a list of DOM nodes to a given parent HTML element.
 *
 * The function takes an array of DOMNode elements and returns a pipeable
 * function that accepts an HTML element as its parent. It then appends
 * each child from the provided array to the parent element in order.
 *
 * @template Element - The type of the parent HTML element.
 * @param {ValidChildDOMElement[]} children - An array of DOM nodes to be appended to the parent element.
 * @returns {PipeableFn<Element>} A function that takes a parent HTML element, appends
 * the provided children to it, and returns the parent element.
 */
export const appendChildren =
  <Element extends HTMLElement>(children: ValidChildDOMElement[]): PipeableFn<Element> =>
  (parent) => {
    children.forEach(appendTo(parent));
    return parent;
  };

/**
 * A function that appends a DOM node or string representation to a given parent HTMLElement.
 *
 * @template Element - The type of the HTMLElement to which the child will be appended.
 * @param {Element} parent - The parent HTMLElement to which the child node will be appended.
 * @returns {PipeableFn<ValidChildDOMElement>} A function that accepts a child node or string and appends it to the parent.
 * The child can either be a valid DOM Node or a string, which will be converted and appended accordingly.
 */
export const appendTo =
  <Element extends HTMLElement>(parent: Element): PipeableFn<ValidChildDOMElement> =>
  (child) => {
    if (!isFalsyElement(child)) {
      parent.append(isInstanceOf(Node, child) ? child : String(child));
    }

    return parent;
  };

export const replaceChildrenOf =
  <Element extends HTMLElement>(parent: Element): PipeableFn<ValidChildDOMElement> =>
  (...children: ValidChildDOMElement[]) => {
    const newChildren = toValidChildDOMElement(children)
      .filter(isValidRenderableChildDOMNode)
      .map((c) => (isInstanceOf(Node, c) ? c : String(c)));
    parent.replaceChildren(...newChildren);
    return parent;
  };

export const normalizeChildrenProps = <Tag extends HtmlElementTag>(
  props: Nullable<DOMElementFactoryProps<Tag>>,
  children: ChildDOMElement[]
): [props: Nullable<Omit<DOMElementFactoryProps<Tag>, 'children'>>, ValidChildDOMElement[]] => {
  if (isValidChildDOMNode(props)) {
    return [props, toValidChildDOMElement(children)];
  }
  const { children: propsChildren = [], ...restProps } = props ?? {};
  const elementChildren = toValidChildDOMElement(children);
  if (isNonEmpty(elementChildren)) {
    return [restProps, elementChildren];
  }
  if (Array.isArray(propsChildren)) {
    return [restProps, toValidChildDOMElement(propsChildren)];
  }
  return [restProps, toValidChildDOMElement([propsChildren])];
};
