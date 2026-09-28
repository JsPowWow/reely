import { mount } from '@reely/dommy';
import type { ChildDOMElement } from '@reely/dommy';
import { noop } from '@reely/utils';

/**
 * Shows one page at a time in `parent`. A page renders under its own owner, so showing the next
 * page takes the current one down with everything it holds: bindings, effects, timers.
 *
 * @param {ParentNode} parent - Where the pages are shown, usually `document.body`.
 * @returns {(render: () => ChildDOMElement) => void} Shows the page `render` builds.
 */
export const createPageView = (parent: ParentNode): ((render: () => ChildDOMElement) => void) => {
  let disposePage: VoidFunction = noop;
  return (render) => {
    disposePage();
    disposePage = mount(parent, render);
  };
};
