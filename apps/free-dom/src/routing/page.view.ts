import { mount } from '@reely/dommy';
import type { ReelyNode } from '@reely/dommy';
import { noop } from '@reely/utils';

/** Shows one page at a time in `parent`; each renders under its own owner, so the next takes the last one down. */
export const createPageView = (parent: ParentNode): ((render: () => ReelyNode) => void) => {
  let disposePage: VoidFunction = noop;
  return (render) => {
    disposePage();
    disposePage = mount(parent, render);
  };
};
