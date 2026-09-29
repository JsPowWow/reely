import { renderElement } from './createElement';
import { toNode } from './utils/element.children';

import type { HtmlElementTag, ReelyNode } from './types/dommy.types';
import type { Component, JSX } from './types/jsx.types';
import type { SvgElementTag } from './types/svg.types';

export type { JSX } from './types/jsx.types';

/** Renders its children without a wrapper element. */
export const Fragment = ({ children }: { children?: ReelyNode }): Node => toNode(children);

/** The automatic JSX runtime; `children` come inside props, the `key` is not rendered. */
export const jsx = (
  type: HtmlElementTag | SvgElementTag | Component,
  props: Record<string, unknown>,
  _key?: PropertyKey
): JSX.Element => renderElement(type, props, []);

export { jsx as jsxs, jsx as jsxDEV };
