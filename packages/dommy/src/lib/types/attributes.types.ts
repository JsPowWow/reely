import type { Nullable, PrimitiveValue } from '@reely/utils';

import type { HtmlElementEvent, ReactiveValue } from './dommy.types';

/** A prop value or a signal/getter of it; a bound `null`/`undefined` removes the attribute. */
export type MaybeReactive<T> = T | ReactiveValue<Nullable<T>>;

export type DOMElementAttributes<T extends HTMLElement> = Exclude<Partial<SafeAttributes<T>>, HtmlElementEvent> & {
  styles?: DOMElementStyles;
  aria?: DOMElementAria;
};

/**
 * ID-reference ARIA attributes: `ARIAMixin` has them only as element arrays (`ariaLabelledByElements`),
 * so here they take space-separated ids; `ariaLabelledby` renders as `aria-labelledby`.
 */
type AriaIdReference =
  | 'ariaActivedescendant'
  | 'ariaControls'
  | 'ariaDescribedby'
  | 'ariaDetails'
  | 'ariaErrormessage'
  | 'ariaFlowto'
  | 'ariaLabelledby'
  | 'ariaOwns';

/** ARIA values by `ARIAMixin` property name (`ariaLabel`) or ID-reference name (`ariaLabelledby`). */
export type DOMElementAria = {
  [K in keyof ARIAMixin as ARIAMixin[K] extends Nullable<string> ? K : never]?: MaybeReactive<string>;
} & {
  [K in AriaIdReference]?: MaybeReactive<string>;
};

/** Inline styles by camelCase property name (`marginTop`) or custom property name (`--flip`). */
export type DOMElementStyles = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K : never]?: MaybeReactive<string>;
} & {
  [K in `--${string}`]?: MaybeReactive<string>;
};

// the read-only properties every HTML element has, such as `tagName` or `clientWidth`, found once
type ReadonlyElementProps = {
  [K in keyof HTMLElement]-?: (<V>() => V extends Pick<HTMLElement, K> ? 1 : 2) extends <V>() => V extends {
    -readonly [P in K]: HTMLElement[P];
  }
    ? 1
    : 2
    ? never
    : K;
}[keyof HTMLElement];

/**
 * DOM properties that are no attributes: `Node`'s, the read-only ones of every element, the text and
 * HTML inside, the scroll, and the token lists `className` and `rel` already set. A prop that holds an
 * object (`style`, `dataset`, `srcObject`) is left out by its type.
 */
type ExcludedDOMProps =
  | keyof Node
  | ReadonlyElementProps
  | 'innerHTML'
  | 'outerHTML'
  | 'innerText'
  | 'outerText'
  | 'scrollTop'
  | 'scrollLeft'
  | 'classList'
  | 'relList';

/**
 * Props the DOM types as the element they point at (`input.list`, `button.form`), while the
 * attribute takes that element's id, as the ID-reference `aria` props do. Token-list props
 * (`sandbox`, `sizes`), `DOMTokenList`s in the DOM, take their attribute's string the same way.
 */
type ElementIdReference = 'list' | 'form';

type SafeAttributes<T> = {
  [K in keyof T as K extends ElementIdReference
    ? K
    : K extends ExcludedDOMProps | AriaAttributes
    ? never
    : T[K] extends Nullable<PrimitiveValue> | DOMTokenList
    ? K
    : never]: K extends ElementIdReference
    ? MaybeReactive<string>
    : T[K] extends DOMTokenList
    ? MaybeReactive<string>
    : MaybeReactive<T[K]>;
} & DataAttributes;

type DataAttributes = {
  [K in `data-${string}`]?: MaybeReactive<string>;
};

type AriaAttributes = {
  [K in keyof ARIAMixin]: K extends `aria${string}` ? K : never;
}[keyof ARIAMixin];
