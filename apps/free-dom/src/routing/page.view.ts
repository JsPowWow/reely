import { mount } from '@reely/dommy';
import type { ReelyNode } from '@reely/dommy';
import { isInstanceOf, isNil, noop } from '@reely/utils';
import type { Nullable } from '@reely/utils';

/** Shows one page at a time in `parent`; each renders under its own owner, so the next takes the last one down. */
export const createPageView = (parent: ParentNode): ((render: () => ReelyNode) => void) => {
  let disposePage: VoidFunction = noop;
  return (render) => {
    disposePage();
    disposePage = mount(parent, render);
  };
};

const placeNamedBy = (hash: string): Nullable<HTMLElement> =>
  hash === '' ? null : document.getElementById(hash.slice(1));

/**
 * After a move to another page: start at the place the URL's hash names, or else at the top, with
 * focus on that place or on the page's heading for screen readers.
 */
export const enterPage = (): void => {
  const place = placeNamedBy(location.hash);
  if (isNil(place)) {
    window.scrollTo(0, 0);
  } else {
    place.scrollIntoView();
  }
  const target = place ?? document.querySelector('h1');
  if (isInstanceOf(HTMLElement, target)) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
};
