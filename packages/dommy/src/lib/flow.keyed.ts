import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

/** @template T - The value the branch is built for. */
export interface KeyedProps<T> {
  /** The value: a signal or a getter; each change of it builds the branch anew. */
  value: ReactiveValue<T>;
  /** Builds the branch for a value. */
  children: (value: T) => ReelyNode;
}

/**
 * Builds a branch for the current value, and a new one, with new state, whenever the value
 * changes: the review form of another participant, the card of another file. The branch it
 * replaces is removed with its subscriptions. `Show` keeps its branch while the truthiness
 * stays; `Keyed` keeps it only while the value stays.
 *
 * @template T - The value the branch is built for.
 * @param {KeyedProps<T>} props - The value and the branch.
 * @returns {DocumentFragment} The branch between the two anchors it keeps its place by.
 */
export const Keyed = <T,>({ value, children }: KeyedProps<T>): DocumentFragment => {
  const slot = createFlowSlot('Keyed');
  bindValue(value, (current) => slot.show(() => children(current)));
  return slot.fragment;
};
