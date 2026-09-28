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

/** A child rendered once: a node, text, a number, or nothing. */
export type StaticReelyNode = Nullable<Node | PrimitiveValue>;

/**
 * A reactive child renders as a text node whose data follows the getter.
 */
export type ReactiveReelyNode = ReactiveValue<Nullable<PrimitiveValue>>;

/** One renderable child, static or reactive; `ReelyNode` adds lists of them. */
export type SingleReelyNode = StaticReelyNode | ReactiveReelyNode;

/**
 * Anything renderable, like React's `ReactNode`: a node, text, a number, a getter or signal (a
 * text node that follows it), nothing (`null`, `undefined`, a boolean) or a list of these.
 * Children and components take and return it; a JSX expression itself is always a `Node`.
 */
export type ReelyNode = SingleReelyNode | readonly ReelyNode[];

export type DOMElementFactoryFunction<Tag extends HtmlElementTag = HtmlElementTag> = (
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ReelyNode[]
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
  | StaticReelyNode
  | ReactiveReelyNode;

/**
 * Receives the element once it is created: an object ref gets it in `current`, a function ref
 * is called with it. dommy never calls a ref with `null`.
 */
export type ElementRef<Elt extends DommyElement> = ObjectReference<Elt> | ((element: Elt) => void);

export type DOMElementFactoryOptionsProps<Tag extends HtmlElementTag> = {
  /** Identity of a list item; never rendered. */
  key?: PropertyKey;
  children?: ReelyNode;
  eventsAbortSignal?: AbortSignal;
  elementRef?: ElementRef<DOMElement<Tag>>;
};
