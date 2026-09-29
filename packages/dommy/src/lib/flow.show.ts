import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

export interface ShowProps {
  /** Only a change of its truthiness switches the branch. */
  when: ReactiveValue<unknown>;
  children: () => ReelyNode;
  /** Nothing by default. */
  fallback?: () => ReelyNode;
}

/**
 * Shows one of two branches by the truthiness of `when`; a hidden branch is removed with its
 * subscriptions.
 */
export const Show = ({ when, children, fallback }: ShowProps): DocumentFragment => {
  const slot = createFlowSlot('Show');
  bindValue(
    () => Boolean(when()),
    (shown) => slot.show(shown ? children : fallback)
  );
  return slot.fragment;
};
