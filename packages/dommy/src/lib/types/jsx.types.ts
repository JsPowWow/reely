import type { DOMElementProps, HtmlElementTag, ReelyNode } from './dommy.types';
import type { SvgElementProps, SvgElementTag } from './svg.types';

/**
 * A function component: takes its props, `children` included, and returns anything renderable.
 * Declared as a method, so components with narrower props still fit (bivariance).
 */
export type Component = {
  bivarianceHack(props: Record<string, unknown>): ReelyNode;
}['bivarianceHack'];

/**
 * JSX types for `jsxImportSource: '@reely/dommy'`: intrinsic elements take the same props as
 * `createElement`, signals and getters included; a component returns any `ReelyNode`, and a JSX
 * expression is always one `Node` (what is not a node goes into a fragment).
 */
export declare namespace JSX {
  type Element = Node;
  type ElementType = HtmlElementTag | SvgElementTag | ((props: never) => ReelyNode);
  type IntrinsicElements = { [Tag in HtmlElementTag]: DOMElementProps<Tag> } & {
    [Tag in SvgElementTag]: SvgElementProps<Tag>;
  };
  interface IntrinsicAttributes {
    key?: PropertyKey;
  }
  interface ElementChildrenAttribute {
    children: unknown;
  }
}
