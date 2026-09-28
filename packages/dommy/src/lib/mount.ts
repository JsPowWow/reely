import { hasSome } from '@reely/utils';

import { withOwner } from './reactive/owner';
import { toNodes } from './utils/element.children';
import { rangeOf, removeNodes } from './utils/element.range';

import type { ReelyNode } from './types/dommy.types';

/**
 * Renders a view into a parent and returns the function that takes it down: it removes the
 * view and releases every binding and effect created while rendering it.
 *
 * @param {ParentNode} parent - The element to append the view to.
 * @param {() => ReelyNode} render - Builds the view.
 * @returns {VoidFunction} Removes the view and releases its subscriptions.
 */
export const mount = (parent: ParentNode, render: () => ReelyNode): VoidFunction =>
  withOwner((dispose) => {
    const nodes = toNodes(render());
    parent.append(...nodes);
    const [first] = nodes;
    const last = nodes.at(-1);
    return (): void => {
      dispose();
      // the view is the range from its first node to its last, with what its flows show now
      if (hasSome(first) && hasSome(last)) {
        removeNodes(rangeOf(first, last));
      }
    };
  });
