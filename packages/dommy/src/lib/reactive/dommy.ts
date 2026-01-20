import { add, derive, state, tags } from './_internals';

import type { TagFunc } from './_internals';
import type { State } from './state';
import type { ChildDOM } from '../types/dommy.types';

type Tags = Readonly<Record<string, TagFunc<Element>>> & {
  [K in keyof HTMLElementTagNameMap]: TagFunc<HTMLElementTagNameMap[K]>;
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
