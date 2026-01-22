import type { PrimitiveValue } from '@reely/utils';

import { add, derive, tags } from './_internals';
import { state } from './state';

import type { State } from './state';
import type { ChildDOM, HtmlElementTag, StateView } from '../types/dommy.types';

export type Val<T> = State<T> | T;

export type PropValue = PrimitiveValue | ((e: any) => void) | null;

export type PropValueOrDerived = PropValue | StateView<PropValue> | (() => PropValue);

export type Props = Record<string, PropValueOrDerived> & { class?: PropValueOrDerived; is?: string };

export type PropsWithKnownKeys<ElementType> = Partial<{ [K in keyof ElementType]: PropValueOrDerived }>;

export type TagFunc<Result> = (
  first?: (Props & PropsWithKnownKeys<Result>) | ChildDOM,
  ...rest: readonly ChildDOM[]
) => Result;

export type Tags = Readonly<Record<string, TagFunc<Element>>> & {
  [K in HtmlElementTag]: TagFunc<HTMLElementTagNameMap[K]>;
};

export interface Dommy {
  readonly state: typeof state;
  readonly derive: <T>(f: () => T) => State<T>;
  readonly add: <E extends Element | DocumentFragment>(dom: E, ...children: readonly ChildDOM[]) => E;
  readonly tags: Tags & ((namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>);
}

const dommy: Dommy = {
  tags,
  add,
  state,
  derive,
};

export default dommy;
