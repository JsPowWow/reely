import { untracked } from '@reely/signals';
import { isTruthy } from '@reely/utils';
import type { Truthy } from '@reely/utils';

import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

export interface ShowProps<T = unknown> {
  /** Only a change of its truthiness switches the branch. */
  when: ReactiveValue<T>;
  /** Gets `when` narrowed to its truthy value, read reactively while the branch is shown. */
  children: (value: ReactiveValue<Truthy<T>>) => ReelyNode;
  /** Nothing by default. */
  fallback?: () => ReelyNode;
}

/**
 * Shows one of two branches by the truthiness of `when`; a hidden branch is removed with its
 * subscriptions.
 */
export const Show = <T>({ when, children, fallback }: ShowProps<T>): DocumentFragment => {
  const slot = createFlowSlot('Show');

  const renderShown = (first: Truthy<T>): ReelyNode => {
    // the branch goes before a falsy value reaches its bindings; a late read gets the last truthy one
    let latest = first;
    return children(() => {
      const current = when();
      if (isTruthy(current)) {
        latest = current;
      }
      return latest;
    });
  };

  bindValue(
    () => Boolean(when()),
    () => {
      const current = untracked(when);
      slot.show(isTruthy(current) ? (): ReelyNode => renderShown(current) : fallback);
    }
  );
  return slot.fragment;
};
