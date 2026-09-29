import type { Nullable } from '@reely/utils';
import { isPlainObject, isSomeFunction, pipe } from '@reely/utils';

import { appendChildren, toElementChildren, toNode } from './utils/element.children';
import { assignElementRef, assignLiveProperties, assignProperties } from './utils/element.properties';
import { isSvgTag, SVG_NAMESPACE } from './utils/element.svg';

import type { DOMElement, DOMElementFactoryProps, HtmlElementTag, ReelyNode } from './types/dommy.types';
import type { Component } from './types/jsx.types';
import type { SvgElement, SvgElementProps, SvgElementTag } from './types/svg.types';

/**
 * Builds an element from untyped props and children, checking them at runtime. Attributes go
 * before the children and live state after them, so a `select` is `multiple` before its options
 * arrive and its `value` finds the option it names.
 */
const buildElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  maybeProps: unknown,
  maybeChildren: readonly unknown[]
): DOMElement<Tag> =>
  pipe(
    document.createElement(tag),
    assignElementRef<DOMElement<Tag>>(maybeProps),
    assignProperties<DOMElement<Tag>>(maybeProps),
    appendChildren<DOMElement<Tag>>(toElementChildren(maybeProps, maybeChildren)),
    assignLiveProperties<DOMElement<Tag>>(maybeProps)
  );

/** Builds an SVG element: the same steps in the SVG namespace. */
const buildSvgElement = <Tag extends SvgElementTag>(
  tag: Tag,
  maybeProps: unknown,
  maybeChildren: readonly unknown[]
): SvgElement<Tag> =>
  pipe(
    document.createElementNS(SVG_NAMESPACE, tag),
    assignElementRef<SvgElement<Tag>>(maybeProps),
    assignProperties<SvgElement<Tag>>(maybeProps),
    appendChildren<SvgElement<Tag>>(toElementChildren(maybeProps, maybeChildren))
  );

/**
 * Props for a component call: the given props without `key`, with argument children, if any,
 * as `children` (one child as is, several as an array).
 */
const toComponentProps = (maybeProps: unknown, maybeChildren: readonly unknown[]): Record<string, unknown> => {
  const { key: _ignoredKey, ...props } = isPlainObject(maybeProps) ? maybeProps : {};
  if (maybeChildren.length === 0) {
    return props;
  }
  return { ...props, children: maybeChildren.length === 1 ? maybeChildren[0] : maybeChildren };
};

/**
 * Renders a tag or calls a component; what JSX compiles to, whichever runtime entry it uses.
 *
 * @param {HtmlElementTag | SvgElementTag | Component} type - A tag name or a component.
 * @param {unknown} maybeProps - Props, `key` and `children` possibly included.
 * @param {readonly unknown[]} maybeChildren - Argument children, if any.
 * @returns {Node} The element, or what the component returned as one node.
 */
export const renderElement = (
  type: HtmlElementTag | SvgElementTag | Component,
  maybeProps: unknown,
  maybeChildren: readonly unknown[]
): Node => {
  if (isSomeFunction(type)) {
    return toNode(type(toComponentProps(maybeProps, maybeChildren)));
  }
  return isSvgTag(type) ? buildSvgElement(type, maybeProps, maybeChildren) : buildElement(type, maybeProps, maybeChildren);
};

/**
 * Creates an HTML element, or an SVG element for an SVG-only tag, with props and children; signals and getters in props and children
 * stay bound to the element. Also calls a component: JSX compiles `<Row {...props} key={id} />`
 * to this function.
 *
 * @template Tag - The HTML tag name, when `type` is a tag.
 * @template Props - The component props, when `type` is a component.
 * @param {HtmlElementTag | Component} type - The tag to create, or a component.
 * @param {unknown} props - Attributes, properties, listeners and options, or component props.
 * @param {ReelyNode[]} children - Children; `props.children` is used when there are none.
 * @returns {Node} The new element, or what the component returned as one node.
 */
export function createElement<Tag extends HtmlElementTag>(
  tag: Tag,
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ReelyNode[]
): DOMElement<Tag>;
export function createElement<Tag extends SvgElementTag>(
  tag: Tag,
  props?: Nullable<SvgElementProps<Tag>>,
  ...children: ReelyNode[]
): SvgElement<Tag>;
export function createElement<Props extends object>(
  component: (props: Props) => ReelyNode,
  props: Props & { key?: PropertyKey },
  ...children: ReelyNode[]
): Node;
export function createElement(
  type: HtmlElementTag | SvgElementTag | Component,
  props?: unknown,
  ...children: ReelyNode[]
): Node {
  return renderElement(type, props, children);
}
