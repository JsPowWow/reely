import type { Nullable, PrimitiveValue, Ref } from '@reely/utils';

import type { DOMElementAttributes } from './attributes.types';
import type { DOMElementEvents } from './event.types';

export type HtmlElementTag = keyof HTMLElementTagNameMap;
export type HtmlElementEvent = keyof GlobalEventHandlers;

export type DOMElement<Tag extends HtmlElementTag> = HTMLElementTagNameMap[Tag];

export type ValidChildDOMElement = Nullable<Node | PrimitiveValue>;

export type ChildDOMElement = ValidChildDOMElement | readonly ChildDOMElement[];

export type DOMElementFactoryFunction<Tag extends HtmlElementTag = HtmlElementTag> = (
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOMElement[]
) => DOMElement<Tag>;

export type DOMElementFactoryProps<Tag extends HtmlElementTag, Elt extends HTMLElement = DOMElement<Tag>> =
  | (DOMElementAttributes<Elt> & DOMElementEvents<Elt> & DOMElementFactoryOptionsProps<Tag>)
  | ValidChildDOMElement;

export type DOMElementFactoryOptionsProps<Tag extends HtmlElementTag> = {
  children?: ChildDOMElement;
  eventsAbortSignal?: AbortSignal;
  elementRef?: Ref<DOMElement<Tag>>;
};
