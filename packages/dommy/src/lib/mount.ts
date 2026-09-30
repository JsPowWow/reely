import { hasSome } from '@reely/basics';
import { withOwner } from '@reely/signals';

import { toNodes } from './utils/element.children';
import { rangeOf, removeNodes } from './utils/element.range';

import type { ReelyNode } from './types/dommy.types';

/**
 * Renders a view into a parent; the returned function removes it and releases every binding and
 * effect created while rendering it.
 */
export const mount = (parent: ParentNode, render: () => ReelyNode): VoidFunction =>
  withOwner((dispose) => {
    const nodes = toNodes(render());
    parent.append(...nodes);
    const [first] = nodes;
    const last = nodes.at(-1);
    return (): void => {
      dispose();
      // a range, not the initial nodes: it includes what its flows show now
      if (hasSome(first) && hasSome(last)) {
        removeNodes(rangeOf(first, last));
      }
    };
  });
