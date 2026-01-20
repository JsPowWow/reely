import type { Nullable, PrimitiveValue } from '@reely/utils';

import type { DOMElementAttributes } from './attributes.types';
import type { DOMElementEvents } from './event.types';
import type { State } from '../reactive/state';

export type HtmlElementTag = keyof HTMLElementTagNameMap;
export type HtmlElementEvent = keyof GlobalEventHandlers;

export type DOMElement<Tag extends HtmlElementTag> = HTMLElementTagNameMap[Tag];

export type ValidChildDOMNode = Nullable<Node | PrimitiveValue>;

export type BindingFunc = ((dom?: Node) => ValidChildDOMNode) | ((dom?: Element) => Element);

export type StateView<T> = Readonly<State<T>>;
export type ChildDOM = ValidChildDOMNode | StateView<Nullable<PrimitiveValue>> | BindingFunc | readonly ChildDOM[];

export type DOMElementFactoryFunction<Tag extends HtmlElementTag> = (
  props?: Nullable<DOMElementFactoryProps<Tag>> | ChildDOM,
  ...children: ChildDOM[]
) => DOMElement<Tag>;

export type DOMElementFactoryProps<Tag extends HtmlElementTag, Elt extends HTMLElement = DOMElement<Tag>> =
  | DOMElementAttributes<Elt> & DOMElementEvents<Elt> & DOMElementFactoryOptionsProps<Tag>;

export interface DOMElementRefObject<T> {
  current: T | null;
}
export type DOMElementRefCallback<T> = { bivarianceHack(instance: T | null): void }['bivarianceHack'];
export type DOMElementRef<T> = DOMElementRefCallback<T> | DOMElementRefObject<T> | null;

export type DOMElementFactoryOptionsProps<Tag extends HtmlElementTag> = {
  children?: ChildDOM;
  eventsAbortSignal?: AbortSignal;
  elementRef?: DOMElementRef<DOMElement<Tag>>;
};
