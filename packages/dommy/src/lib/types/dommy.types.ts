import type { Nullable, ObjectReference, PrimitiveValue } from '@reely/utils';

import type { DOMElementAttributes } from './attributes.types';
import type { DOMElementEvents } from './event.types';

export type HtmlElementTag = keyof HTMLElementTagNameMap;
export type HtmlElementEvent = keyof GlobalEventHandlers;

export type DOMElement<Tag extends HtmlElementTag> = HTMLElementTagNameMap[Tag];

/** An element dommy creates: HTML, or SVG for SVG-only tags. */
export type DommyElement = HTMLElement | SVGElement;

/**
 * A reactive value: a signal or any getter. Bound props and children re-read it
 * when the signals it reads change.
 */
export type ReactiveValue<T> = () => T;

export type StaticChildDOMElement = Nullable<Node | PrimitiveValue>;

/**
 * A reactive child renders as a text node whose data follows the getter.
 */
export type ReactiveChildDOMElement = ReactiveValue<Nullable<PrimitiveValue>>;

export type ValidChildDOMElement = StaticChildDOMElement | ReactiveChildDOMElement;

export type ChildDOMElement = ValidChildDOMElement | readonly ChildDOMElement[];

export type DOMElementFactoryFunction<Tag extends HtmlElementTag = HtmlElementTag> = (
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOMElement[]
) => DOMElement<Tag>;

/**
 * Props of an element: attributes, live properties, ARIA, styles, listeners and options.
 */
export type DOMElementProps<
  Tag extends HtmlElementTag,
  Elt extends HTMLElement = DOMElement<Tag>
> = DOMElementAttributes<Elt> & DOMElementEvents<Elt> & DOMElementFactoryOptionsProps<Tag>;

/**
 * The first argument of a tag factory: props, or a child in place of props.
 */
export type DOMElementFactoryProps<Tag extends HtmlElementTag> =
  | DOMElementProps<Tag>
  | StaticChildDOMElement
  | ReactiveChildDOMElement;

/**
 * Receives the element once it is created: an object ref gets it in `current`, a function ref
 * is called with it. dommy never calls a ref with `null`.
 */
export type ElementRef<Elt extends DommyElement> = ObjectReference<Elt> | ((element: Elt) => void);

export type DOMElementFactoryOptionsProps<Tag extends HtmlElementTag> = {
  /** Identity of a list item; never rendered. */
  key?: PropertyKey;
  children?: ChildDOMElement;
  eventsAbortSignal?: AbortSignal;
  elementRef?: ElementRef<DOMElement<Tag>>;
};
