import { isInstanceOf, isString } from '@reely/utils';

import { withOwner } from './reactive/owner';
import { toChildNodes } from './utils/element.children';

import type { ChildDOMElement } from './types/dommy.types';

/** The nodes a view puts into its parent: a fragment gives its children, a string a text node. */
const toViewNodes = (child: Node | string): Node[] => {
  if (isString(child)) {
    return [document.createTextNode(child)];
  }
  return isInstanceOf(DocumentFragment, child) ? Array.from(child.childNodes) : [child];
};

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
    const nodes = toChildNodes([render()]).flatMap(toViewNodes);
    parent.append(...nodes);
    return (): void => {
      dispose();
      for (const node of nodes) {
        node.parentNode?.removeChild(node);
      }
    };
  });
