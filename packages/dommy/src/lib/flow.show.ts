import { hasSome, noop } from '@reely/utils';

import { getOwner, withOwner } from './reactive/owner';
import { bindValue } from './utils/element.bindings';
import { toNodes } from './utils/element.children';
import { createAnchors, insertBefore, rangeOf, removeNodes } from './utils/element.range';

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
  const owner = getOwner();
  const { fragment, start, end } = createAnchors('Show');
  let disposeBranch: VoidFunction = noop;

  const showBranch = (shown: boolean): void => {
    disposeBranch();
    removeNodes(rangeOf(start, end).slice(1, -1));
    const render = shown ? children : fallback;
    disposeBranch = withOwner((dispose) => {
      if (hasSome(render)) {
        insertBefore(end, toNodes(render()));
      }
      return dispose;
    }, owner);
  };

  bindValue(() => Boolean(when()), showBranch);
  return fragment;
};
