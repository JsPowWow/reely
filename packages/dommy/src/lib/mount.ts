import { withOwner } from './reactive/owner';
import { toNodes } from './utils/element.children';

import type { ChildDOMElement } from './types/dommy.types';

/**
 * Renders a view into a parent and returns the function that takes it down: it removes the
 * view and releases every binding and effect created while rendering it.
 *
 * @param {ParentNode} parent - The element to append the view to.
 * @param {() => ChildDOMElement} render - Builds the view.
 * @returns {VoidFunction} Removes the view and releases its subscriptions.
 */
export const mount = (parent: ParentNode, render: () => ChildDOMElement): VoidFunction =>
  withOwner((dispose) => {
    const nodes = toNodes(render());
    parent.append(...nodes);
    return (): void => {
      dispose();
      for (const node of nodes) {
        node.parentNode?.removeChild(node);
      }
    };
  });
