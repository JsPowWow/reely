import type { Nullable } from '@reely/utils';
import { isPlainObject, isSomeFunction, pipe } from '@reely/utils';

import { appendChildren, toElementChildren } from './utils/element.children';
import { assignElementRef, assignProperties } from './utils/element.properties';

import type { ChildDOMElement, DOMElement, DOMElementFactoryProps, HtmlElementTag } from './types/dommy.types';
import type { Component } from './types/jsx.types';

/**
 * Builds an element from untyped props and children, checking them at runtime; the shared core
 * of `createElement` and the JSX runtime.
 *
 * @template Tag - The HTML tag name.
 * @param {Tag} tag - The tag to create.
 * @param {unknown} maybeProps - The props object, a child in place of props, or nothing.
 * @param {readonly unknown[]} maybeChildren - The argument children; `props.children` is used when empty.
 * @returns {DOMElement<Tag>} The new element.
 */
export const buildElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  maybeProps: unknown,
  maybeChildren: readonly unknown[]
): DOMElement<Tag> =>
  pipe(
    document.createElement(tag),
    assignElementRef<DOMElement<Tag>>(maybeProps),
    assignProperties<DOMElement<Tag>>(maybeProps),
    appendChildren<DOMElement<Tag>>(toElementChildren(maybeProps, maybeChildren))
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
 * @param {HtmlElementTag | Component} type - A tag name or a component.
 * @param {unknown} maybeProps - Props, `key` and `children` possibly included.
 * @param {readonly unknown[]} maybeChildren - Argument children, if any.
 * @returns {ChildDOMElement} The element, or what the component returned.
 */
export const renderElement = (
  type: HtmlElementTag | Component,
  maybeProps: unknown,
  maybeChildren: readonly unknown[]
): ChildDOMElement =>
  isSomeFunction(type)
    ? type(toComponentProps(maybeProps, maybeChildren))
    : buildElement(type, maybeProps, maybeChildren);

/**
 * Creates an HTML element with props and children; signals and getters in props and children
 * stay bound to the element. Also calls a component: JSX compiles `<Row {...props} key={id} />`
 * to this function.
 *
 * @param {HtmlElementTag | Component} type - The tag to create, or a component.
 * @param {unknown} props - Attributes, properties, listeners and options, or component props.
 * @param {ChildDOMElement[]} children - Children; `props.children` is used when there are none.
 * @returns {ChildDOMElement} The new element, or what the component returned.
 */
export function createElement<Tag extends HtmlElementTag>(
  tag: Tag,
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOMElement[]
): DOMElement<Tag>;
export function createElement<Props extends object>(
  component: (props: Props) => ChildDOMElement,
  props: Props & { key?: PropertyKey },
  ...children: ChildDOMElement[]
): ChildDOMElement;
export function createElement(
  type: HtmlElementTag | Component,
  props?: unknown,
  ...children: ChildDOMElement[]
): ChildDOMElement {
  return renderElement(type, props, children);
}
