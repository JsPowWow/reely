import { hasSome, noop } from '@reely/utils';

import { toNodes } from './element.children';
import { createAnchors, insertBefore, rangeOf, removeNodes } from './element.range';
import { getOwner, withOwner } from '../reactive/owner';

import type { ReelyNode } from '../types/dommy.types';

/** A place a flow shows one branch at a time in: `show` replaces the branch, bindings included. */
export interface FlowSlot {
  /** The two anchors the slot keeps its place by, to insert where the flow stands. */
  readonly fragment: DocumentFragment;
  /** Removes the shown branch with its subscriptions, then renders `render`; nothing without it. */
  readonly show: (render?: () => ReelyNode) => void;
}

/**
 * Creates the slot of a flow. Branches render under the owner of the render that created the
 * slot, so disposing that render disposes the shown branch too, even one shown later.
 *
 * @param {string} name - The flow name, shown in the anchor comments.
 * @returns {FlowSlot} The slot.
 */
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
