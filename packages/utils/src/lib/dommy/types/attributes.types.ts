import type { HtmlElementEvent } from './hyperscript.types';
import type { AnyFunction } from '../../types/function.types';

export type DOMElementAttributes<T extends HTMLElement> = Exclude<Partial<SafeAttributes<T>>, HtmlElementEvent> & {
  styles?: Partial<CSSStyleDeclaration>;
  aria?: Partial<ARIAMixin>;
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
    : never]: T[K];
} & DataAttributes;

type DataAttributes = {
  [K in `data-${string}`]?: string;
};

type AriaAttributes = {
  [K in keyof ARIAMixin]: K extends `aria${string}` ? K : never;
}[keyof ARIAMixin];
