import type { AnyFunction, Nullable } from '@reely/utils';

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

type ExcludedDOMProps =
  | 'classList'
  | 'relList'
  | 'style'
  | 'dataset'
  | 'attributes'
  | 'children'
  | 'firstChild'
  | 'lastChild'
  | 'parentElement'
  | 'parentNode'
  | 'ownerDocument'
  | 'childNodes';

/**
 * Props the DOM types as the element they point at (`input.list`, `button.form`), while the
 * attribute takes that element's id, as the ID-reference `aria` props do. Token-list props
 * (`sandbox`, `sizes`), `DOMTokenList`s in the DOM, take their attribute's string the same way.
 */
type ElementIdReference = 'list' | 'form';

type SafeAttributes<T> = {
  [K in keyof T as K extends ExcludedDOMProps
    ? never
    : K extends AriaAttributes
    ? never
    : Extract<T[K], AnyFunction> extends never
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
