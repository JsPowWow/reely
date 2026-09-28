import type { AnyFunction, Nullable } from '@reely/utils';

import type { HtmlElementEvent, ReactiveValue } from './dommy.types';

/**
 * A prop value or a signal/getter of it; a bound `null`/`undefined` removes the attribute.
 */
export type MaybeReactive<T> = T | ReactiveValue<Nullable<T>>;

export type DOMElementAttributes<T extends HTMLElement> = Exclude<Partial<SafeAttributes<T>>, HtmlElementEvent> & {
  styles?: DOMElementStyles;
  aria?: Partial<ARIAMixin>;
};

/**
 * Inline styles by camelCase property name (`marginTop`) or custom property name (`--flip`),
 * each static or reactive.
 */
export type DOMElementStyles = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K : never]?: MaybeReactive<string>;
} & {
  [K in `--${string}`]?: MaybeReactive<string>;
};

type ExcludedDOMProps =
  | 'classList'
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

type SafeAttributes<T> = {
  [K in keyof T as K extends ExcludedDOMProps
    ? never
    : K extends AriaAttributes
    ? never
    : Extract<T[K], AnyFunction> extends never
    ? K
    : never]: MaybeReactive<T[K]>;
} & DataAttributes;

type DataAttributes = {
  [K in `data-${string}`]?: MaybeReactive<string>;
};

type AriaAttributes = {
  [K in keyof ARIAMixin]: K extends `aria${string}` ? K : never;
}[keyof ARIAMixin];
