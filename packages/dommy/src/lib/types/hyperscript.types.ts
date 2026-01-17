import type { Nullable, PrimitiveValue } from '@reely/utils';

import type { DOMElementAttributes } from './attributes.types';
import type { DOMElementEvents } from './event.types';

export type HtmlElementTag = keyof HTMLElementTagNameMap;
export type HtmlElementEvent = keyof GlobalEventHandlers;

export type DOMElement<Tag extends HtmlElementTag> = HTMLElementTagNameMap[Tag];
export type DOMNode = Nullable<Node | PrimitiveValue | bigint>;

export type DOMElementFactoryFunction<Tag extends HtmlElementTag> = (
  props?: Nullable<DOMElementFactoryProps<Tag>> | DOMNode | (DOMNode | DOMNode[])[],
  ...children: (DOMNode | DOMNode[])[]
) => DOMElement<Tag>;

export type DOMElementFactoryProps<Tag extends HtmlElementTag, Elt extends HTMLElement = DOMElement<Tag>> =
  | DOMElementAttributes<Elt> & DOMElementEvents<Elt> & DOMElementFactoryOptionsProps<Tag>;

export interface DOMElementRefObject<T> {
  current: T | null;
}
export type DOMElementRefCallback<T> = { bivarianceHack(instance: T | null): void }['bivarianceHack'];
export type DOMElementRef<T> = DOMElementRefCallback<T> | DOMElementRefObject<T> | null;

export type DOMElementFactoryOptionsProps<Tag extends HtmlElementTag> = {
  children?: DOMNode | DOMNode[];
  eventsAbortSignal?: AbortSignal;
  elementRef?: DOMElementRef<DOMElement<Tag>>;
};
