import type { Nullable } from '@reely/utils';
import { pipe } from '@reely/utils';

import { appendChildren, toElementChildren } from './utils/element.children';
import { assignElementRef, assignProperties } from './utils/element.properties';

import type { ChildDOMElement, DOMElement, DOMElementFactoryProps, HtmlElementTag } from './types/dommy.types';

/**
 * Builds an element from untyped props and children, checking them at runtime; the shared core
 * of `createElement` and the JSX runtime.
 *
 * @template Tag - The HTML tag name.
 * @param {Tag} tag - The tag to create.
 * @param {unknown} props - The props object, a child in place of props, or nothing.
 * @param {readonly unknown[]} children - The argument children; `props.children` is used when empty.
 * @returns {DOMElement<Tag>} The new element.
 */
export const buildElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  props: unknown,
  children: readonly unknown[]
): DOMElement<Tag> =>
  pipe(
    document.createElement(tag),
    assignElementRef<DOMElement<Tag>>(props),
    assignProperties<DOMElement<Tag>>(props),
    appendChildren<DOMElement<Tag>>(toElementChildren(props, children))
  );

/**
 * Creates an HTML element with props and children; signals and getters in props and children
 * stay bound to the element.
 *
 * @template Tag - The HTML tag name.
 * @param {Tag} tag - The tag to create.
 * @param {Nullable<DOMElementFactoryProps<Tag>>} props - Attributes, properties, listeners and options.
 * @param {ChildDOMElement[]} children - Children; `props.children` is used when there are none.
 * @returns {DOMElement<Tag>} The new element.
 */
export const createElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOMElement[]
): DOMElement<Tag> => buildElement(tag, props, children);
