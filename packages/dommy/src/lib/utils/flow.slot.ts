import { hasSome } from '@reely/basics';
import { getOwner, withOwner } from '@reely/signals';
import { noop } from '@reely/utils';

import { toNodes } from './element.children';
import { createAnchors, insertBefore, rangeOf, removeNodes } from './element.range';

import type { ReelyNode } from '../types/dommy.types';

/** A place a flow shows one branch at a time in: `show` replaces the branch, bindings included. */
export interface FlowSlot {
  /** The two anchors to insert where the flow stands. */
  readonly fragment: DocumentFragment;
  /** Removes the shown branch with its subscriptions, then renders `render`; nothing without it. */
  readonly show: (render?: () => ReelyNode) => void;
}

// Branches render under the owner that created the slot, so disposing it disposes a branch shown later too.
export const createFlowSlot = (name: string): FlowSlot => {
  const owner = getOwner();
  const { fragment, start, end } = createAnchors(name);
  let disposeBranch: VoidFunction = noop;

  const show = (render?: () => ReelyNode): void => {
    disposeBranch();
    removeNodes(rangeOf(start, end).slice(1, -1));
    disposeBranch = withOwner((dispose) => {
      if (hasSome(render)) {
        insertBefore(end, toNodes(render()));
      }
      return dispose;
    }, owner);
  };

  return { fragment, show };
};
