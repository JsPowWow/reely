import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

export interface ShowProps {
  /** The condition: a signal or a getter; only a change of its truthiness switches the branch. */
  when: ReactiveValue<unknown>;
  /** Renders the branch shown while `when` is truthy. */
  children: () => ReelyNode;
  /** Renders the branch shown while `when` is falsy; nothing by default. */
  fallback?: () => ReelyNode;
}

/**
 * Shows one of two branches by the truthiness of `when`. A branch is rendered when it is shown
 * and removed with its subscriptions when it is hidden; while the truthiness stays, the shown
 * branch stays as it is and updates through its own bindings.
 *
 * @param {ShowProps} props - The condition and the two branches.
 * @returns {DocumentFragment} The shown branch between the two anchors it keeps its place by.
 */
export const Show = ({ when, children, fallback }: ShowProps): DocumentFragment => {
  const slot = createFlowSlot('Show');
  bindValue(
    () => Boolean(when()),
    (shown) => slot.show(shown ? children : fallback)
  );
  return slot.fragment;
};
