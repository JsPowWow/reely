import { noop } from '@reely/utils';

import { getOwner, withOwner } from './reactive/owner';
import { bindValue } from './utils/element.bindings';
import { toNodes } from './utils/element.children';

import type { ChildDOMElement, ReactiveValue } from './types/dommy.types';

export interface ShowProps {
  /** The condition: a signal or a getter; only a change of its truthiness switches the branch. */
  when: ReactiveValue<unknown>;
  /** Renders the branch shown while `when` is truthy. */
  children: () => ChildDOMElement;
  /** Renders the branch shown while `when` is falsy; nothing by default. */
  fallback?: () => ChildDOMElement;
}

/**
 * Shows one of two branches by the truthiness of `when`. A branch is rendered when it is shown
 * and removed with its subscriptions when it is hidden; while the truthiness stays, the shown
 * branch stays as it is and updates through its own bindings.
 *
 * @param {ShowProps} props - The condition and the two branches.
 * @returns {DocumentFragment} The shown branch followed by the anchor it keeps its place by.
 */
export const Show = ({ when, children, fallback }: ShowProps): DocumentFragment => {
  const owner = getOwner();
  const end = document.createComment('Show');
  const fragment = document.createDocumentFragment();
  fragment.append(end);
  let nodes: readonly Node[] = [];
  let disposeBranch: VoidFunction = noop;

  const showBranch = (shown: boolean): void => {
    const parent = end.parentNode;
    if (parent === null) {
      return;
    }
    disposeBranch();
    for (const node of nodes) {
      parent.removeChild(node);
    }
    const render = shown ? children : fallback;
    [nodes, disposeBranch] = withOwner((dispose) => [render === undefined ? [] : toNodes(render()), dispose], owner);
    for (const node of nodes) {
      parent.insertBefore(node, end);
    }
  };

  bindValue(() => Boolean(when()), showBranch);
  return fragment;
};
