import type { AnyFunction } from '@reely/utils';
import { isSomeFunction } from '@reely/utils';

import { buildElement } from './createElement';
import { toChildNode } from './utils/element.bindings';
import { toValidChildDOMElement } from './utils/element.utils';

import type { ChildDOMElement, DOMElementProps, HtmlElementTag } from './types/dommy.types';

/**
 * JSX types for `jsxImportSource: '@reely/dommy'`: intrinsic elements take the same props as
 * `createElement`, signals and getters included; a component returns anything renderable.
 */
export declare namespace JSX {
  type Element = ChildDOMElement;
  type ElementType = HtmlElementTag | ((props: never) => ChildDOMElement);
  type IntrinsicElements = { [Tag in HtmlElementTag]: DOMElementProps<Tag> };
  interface IntrinsicAttributes {
    key?: PropertyKey;
  }
  interface ElementChildrenAttribute {
    children: unknown;
  }
}

/**
 * Renders its children without a wrapper element.
 *
 * @param {{ children?: ChildDOMElement }} props - The children to render.
 * @returns {DocumentFragment} A fragment holding the children.
 */
export const Fragment = ({ children }: { children?: ChildDOMElement }): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  fragment.append(...toValidChildDOMElement([children]).map(toChildNode));
  return fragment;
};

/**
 * The automatic JSX runtime: builds an element for a tag, or calls a component with its props.
 * `children` come inside props; the `key` is not rendered.
 *
 * @param {HtmlElementTag | AnyFunction} type - A tag name or a component.
 * @param {Record<string, unknown>} props - Props, `children` included.
 * @param {PropertyKey} [_key] - The key of a list item; unused until keyed lists.
 * @returns {JSX.Element} The rendered node, or what the component returned.
 */
export const jsx = (
  type: HtmlElementTag | AnyFunction,
  props: Record<string, unknown>,
  _key?: PropertyKey
): JSX.Element => (isSomeFunction(type) ? type(props) : buildElement(type, props, []));

export { jsx as jsxs, jsx as jsxDEV };
