import { renderElement } from './createElement';
import { toChildNodes } from './utils/element.children';

import type { ChildDOMElement, HtmlElementTag } from './types/dommy.types';
import type { Component, JSX } from './types/jsx.types';
import type { SvgElementTag } from './types/svg.types';

export type { JSX } from './types/jsx.types';

/**
 * Renders its children without a wrapper element.
 *
 * @param {{ children?: ChildDOMElement }} props - The children to render.
 * @returns {DocumentFragment} A fragment holding the children.
 */
export const Fragment = ({ children }: { children?: ChildDOMElement }): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  fragment.append(...toChildNodes([children]));
  return fragment;
};

/**
 * The automatic JSX runtime: builds an element for a tag, or calls a component with its props.
 * `children` come inside props; the `key` is not rendered.
 *
 * @param {HtmlElementTag | SvgElementTag | Component} type - A tag name or a component.
 * @param {Record<string, unknown>} props - Props, `children` included.
 * @param {PropertyKey} [_key] - The key of a list item; unused until keyed lists.
 * @returns {JSX.Element} The rendered node, or what the component returned.
 */
export const jsx = (
  type: HtmlElementTag | SvgElementTag | Component,
  props: Record<string, unknown>,
  _key?: PropertyKey
): JSX.Element => renderElement(type, props, []);

export { jsx as jsxs, jsx as jsxDEV };
