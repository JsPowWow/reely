import { isSomeFunction } from '@reely/basics';
import type { Nullable } from '@reely/utils';
import { isKeyValueObject, pipe } from '@reely/utils';

import { appendChildren, toElementChildren, toNode } from './utils/element.children';
import { assignElementRef, assignLiveProperties, assignProperties } from './utils/element.properties';
import { isSvgTag, SVG_NAMESPACE } from './utils/element.svg';

import type { DOMElement, DOMElementFactoryProps, HtmlElementTag, ReelyNode } from './types/dommy.types';
import type { Component } from './types/jsx.types';
import type { SvgElement, SvgElementProps, SvgElementTag } from './types/svg.types';

// Attributes before the children, live state after: a `select` is `multiple` before its options
// arrive, and its `value` finds the option it names.
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

const toComponentProps = (maybeProps: unknown, maybeChildren: readonly unknown[]): Record<string, unknown> => {
  const { key: _ignoredKey, ...props } = isKeyValueObject(maybeProps) ? maybeProps : {};
  if (maybeChildren.length === 0) {
    return props;
  }
  return { ...props, children: maybeChildren.length === 1 ? maybeChildren[0] : maybeChildren };
};

/** What JSX compiles to, whichever runtime entry it uses. */
export const renderElement = (
  type: HtmlElementTag | SvgElementTag | Component,
  maybeProps: unknown,
  maybeChildren: readonly unknown[]
): Node => {
  if (isSomeFunction(type)) {
    return toNode(type(toComponentProps(maybeProps, maybeChildren)));
  }
  return isSvgTag(type)
    ? buildSvgElement(type, maybeProps, maybeChildren)
    : buildElement(type, maybeProps, maybeChildren);
};

/**
 * Creates an HTML element (an SVG one for an SVG-only tag) or calls a component; signals and
 * getters in props and children stay bound. `props.children` is used when no children are passed.
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
  // props may be left out only when every one is optional
  ...propsAndChildren: object extends Props
    ? [props?: Nullable<Props & { key?: PropertyKey }>, ...children: ReelyNode[]]
    : [props: Props & { key?: PropertyKey }, ...children: ReelyNode[]]
): Node;
export function createElement(
  type: HtmlElementTag | SvgElementTag | Component,
  props?: unknown,
  ...children: ReelyNode[]
): Node {
  return renderElement(type, props, children);
}
