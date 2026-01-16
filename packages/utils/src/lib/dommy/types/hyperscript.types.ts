import type { DOMElementAttributes } from './attributes.types';
import type { DOMElementEvents } from './event.types';
import type { Nullable, PrimitiveValue } from '../../types/core.types';

export type HtmlElementTag = keyof HTMLElementTagNameMap;
export type HtmlElementEvent = keyof GlobalEventHandlers;

export type DOMElement<Tag extends HtmlElementTag> = HTMLElementTagNameMap[Tag];
export type DOMNode = Nullable<Node | PrimitiveValue | bigint>;

export type DOMElementFactoryFunction<Tag extends HtmlElementTag> = (
  props: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: DOMNode[]
) => DOMElement<Tag>;

export type DOMElementFactoryProps<
  Tag extends HtmlElementTag,
  Elt extends HTMLElement = DOMElement<Tag>
> = DOMElementAttributes<Elt> & DOMElementEvents<Elt> & DOMElementFactoryOptionsProps;

export type DOMElementFactoryOptionsProps = {
  children?: DOMNode | DOMNode[];
  eventsAbortSignal?: AbortSignal;
};
