import { hasSome, isPlainObject } from '@reely/basics';
import { hasProperty, isInstanceOf, isNumber } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { decode } from './router.decode';

const scrollKey = 'reelyScroll';

// where the reader had scrolled the page of a history entry, kept in its state for a reload too
const scrollOf = (state: unknown): number | undefined => {
  const scrolled = hasProperty(scrollKey, state) ? state[scrollKey] : undefined;
  return isNumber(scrolled) ? scrolled : undefined;
};

// keeps where the page of the current history entry is scrolled, and what else its state held
export const keepScroll = (): void => {
  history.replaceState({ ...(isPlainObject(history.state) ? history.state : {}), [scrollKey]: window.scrollY }, '');
};

const placeInUrl = (): Nullable<HTMLElement> =>
  location.hash === '' ? null : document.getElementById(decode(location.hash.slice(1)));

const headingIn = (page: readonly Node[]): Nullable<Element> => {
  for (const node of page) {
    const heading = isInstanceOf(Element, node) && !node.matches('h1') ? node.querySelector('h1') : node;
    if (isInstanceOf(Element, heading) && heading.matches('h1')) {
      return heading;
    }
  }
  return null;
};

// where a page opens: where the reader had scrolled it, the place its URL names, or, after a move,
// the top; a move also brings focus to that place or to the page's heading
export const arrive = (page: readonly Node[], moved: boolean): void => {
  const place = placeInUrl();
  const scrolled = scrollOf(history.state);
  if (hasSome(scrolled)) {
    window.scrollTo(0, scrolled);
  } else if (hasSome(place)) {
    place.scrollIntoView();
  } else if (moved) {
    window.scrollTo(0, 0);
  }
  const target = place ?? (moved ? headingIn(page) : null);
  if (isInstanceOf(HTMLElement, target)) {
    if (!target.hasAttribute('tabindex')) {
      target.tabIndex = -1;
    }
    target.focus({ preventScroll: true });
  }
};
