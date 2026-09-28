import type { ChildDOMElement, DOMElementProps, HtmlElementTag } from './dommy.types';

/**
 * A function component: takes its props, `children` included, and returns anything renderable.
 * Declared as a method, so components with narrower props still fit (bivariance).
 */
export type Component = {
  bivarianceHack(props: Record<string, unknown>): ChildDOMElement;
}['bivarianceHack'];

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
