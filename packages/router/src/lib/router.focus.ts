import { isInstanceOf } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import type { Shown } from './router.history';

const firstOf = (shown: Shown, selector: string): Nullable<Element> => {
  for (const node of isInstanceOf(Node, shown) ? [shown] : shown) {
    const found = isInstanceOf(Element, node) && !node.matches(selector) ? node.querySelector(selector) : node;
    if (isInstanceOf(Element, found) && found.matches(selector)) {
      return found;
    }
  }
  return null;
};

/**
 * The heading of a page shown, not one the app shows around it: its `h1`, or its first heading of any
 * level when it has none (a widget's pages start at `h2`).
 */
export const headingIn = (shown: Shown): Nullable<Element> =>
  firstOf(shown, 'h1') ?? firstOf(shown, 'h1, h2, h3, h4, h5, h6');

// a screen reader starts reading the new page there; the scroll is the router's to set
export const focusOn = (target: Nullable<Element>): void => {
  if (isInstanceOf(HTMLElement, target)) {
    if (!target.hasAttribute('tabindex')) {
      target.tabIndex = -1;
    }
    target.focus({ preventScroll: true });
  }
};
