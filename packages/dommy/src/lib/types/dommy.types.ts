import type { Nullable, PrimitiveValue, Ref } from '@reely/utils';

import type { DOMElementAttributes } from './attributes.types';
import type { DOMElementEvents } from './event.types';

export type HtmlElementTag = keyof HTMLElementTagNameMap;
export type HtmlElementEvent = keyof GlobalEventHandlers;

export type DOMElement<Tag extends HtmlElementTag> = HTMLElementTagNameMap[Tag];

export type ValidChildDOMNode = Nullable<Node | PrimitiveValue>;

export type BindingFunc = ((dom?: Node) => ValidChildDOMNode) | ((dom?: Element) => Element);

export type ChildDOM = ValidChildDOMNode | BindingFunc | readonly ChildDOM[];

export type DOMElementFactoryFunction<Tag extends HtmlElementTag> = (
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOM[]
) => DOMElement<Tag>;

export type DOMElementFactoryProps<Tag extends HtmlElementTag, Elt extends HTMLElement = DOMElement<Tag>> =
  | DOMElementAttributes<Elt> & DOMElementEvents<Elt> & DOMElementFactoryOptionsProps<Tag>;

export type DOMElementFactoryOptionsProps<Tag extends HtmlElementTag> = {
  children?: ChildDOM;
  eventsAbortSignal?: AbortSignal;
  elementRef?: Ref<DOMElement<Tag>>;
};
