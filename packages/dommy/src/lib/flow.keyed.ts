import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

export interface KeyedProps<T> {
  value: ReactiveValue<T>;
  /** `null` and `undefined` come too; return `null` for no branch. */
  children: (value: T) => ReelyNode;
}

/**
 * Builds a new branch, with new state, whenever the value changes; the old one is removed with its
 * subscriptions. `Show` keeps its branch while the truthiness stays; `Keyed` only while the value does.
 */
export const Keyed = <T>({ value, children }: KeyedProps<T>): DocumentFragment => {
  const slot = createFlowSlot('Keyed');
  bindValue(value, (current) => slot.show(() => children(current)));
  return slot.fragment;
};
