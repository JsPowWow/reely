import type { Nil, PipeableFunction, Nullable } from '@reely/utils';
import { isBigInt, isBoolean, isNumber, isNonEmpty, isString, isInstanceOf, isNil, Maybe } from '@reely/utils';

import type { ChildDOM, DOMElementFactoryProps, HtmlElementTag, ValidChildDOMNode } from '../types/dommy.types';

export const isFalsyElement = (element: unknown): element is Nil | false => isNil(element) || element === false;

export const isValidChildDOMNode = (child: unknown): child is ValidChildDOMNode =>
  isInstanceOf(Node, child) || isString(child) || isNumber(child) || isBigInt(child) || isBoolean(child);

export const isValidRenderableChildDOMNode = (child: unknown): child is ValidChildDOMNode =>
  isValidChildDOMNode(child) && !isFalsyElement(child);

/**
 * Appends a list of DOM nodes to a given parent HTML element.
 *
 * The function takes an array of DOMNode elements and returns a pipeable
 * function that accepts an HTML element as its parent. It then appends
 * each child from the provided array to the parent element in order.
 *
 * @template Element - The type of the parent HTML element.
 * @param {ValidChildDOMNode[]} children - An array of DOM nodes to be appended to the parent element.
 * @returns {PipeableFunction<Element>} A function that takes a parent HTML element, appends
 * the provided children to it, and returns the parent element.
 */
export const appendChildren =
  <Element extends HTMLElement>(children: ValidChildDOMNode[]): PipeableFunction<Element> =>
  (parent) => {
    children.forEach(appendTo(parent));
    return parent;
  };

/**
 * A function that appends a DOM node or string representation to a given parent HTMLElement.
 *
 * @template Element - The type of the HTMLElement to which the child will be appended.
 * @param {Element} parent - The parent HTMLElement to which the child node will be appended.
 * @returns {PipeableFunction<ValidChildDOMNode>} A function that accepts a child node or string and appends it to the parent.
 * The child can either be a valid DOM Node or a string, which will be converted and appended accordingly.
 */
export const appendTo =
  <Element extends HTMLElement>(parent: Element): PipeableFunction<ValidChildDOMNode> =>
  (child) => {
    if (!isFalsyElement(child)) {
      parent.append(isInstanceOf(Node, child) ? child : String(child));
    }

    return parent;
  };

export const replaceChildrenOf =
  <Element extends HTMLElement>(parent: Element): PipeableFunction<ValidChildDOMNode> =>
  (...children: ValidChildDOMNode[]) => {
    const newChildren = children
      .flat()
      .filter(isValidRenderableChildDOMNode)
      .map((c) => (isInstanceOf(Node, c) ? c : String(c)));
    parent.replaceChildren(...newChildren);
    return parent;
  };

export const extractChildrenFromProps = (
  props: Nullable<DOMElementFactoryProps<HtmlElementTag>>,
  children: ChildDOM[]
): [props: DOMElementFactoryProps<HtmlElementTag>, ChildDOM[]] => {
  const elementChildren = children.flat();
  const childrenToAdd = isNonEmpty(elementChildren)
    ? elementChildren
    : Maybe.from(props)
        .map(({ children }) => (Array.isArray(children) ? children : [children]))
        .getOrDefault([]);
  const { children: _ignored, ...restProps } = props ?? {};
  return [restProps, childrenToAdd];
};
