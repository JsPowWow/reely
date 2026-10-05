import { isPlainObject } from '@reely/basics';
import { hasProperty, isNil, isNumber } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { decode } from './router.decode';

const scrollKey = 'reelyScroll';

/** Where the reader had scrolled the page of the current history entry, kept in its state for a reload too. */
export const keptScroll = (): number | undefined => {
  const { state } = history;
  const scrolled = hasProperty(scrollKey, state) ? state[scrollKey] : undefined;
  return isNumber(scrolled) ? scrolled : undefined;
};

/**
 * Keeps where the page of the current history entry is scrolled, and what else its state held; a state
 * the app stored that is no plain object stays as it is.
 */
export const keepScroll = (): void => {
  const { state } = history;
  if (!isNil(state) && !isPlainObject(state)) {
    return;
  }
  try {
    history.replaceState({ ...state, [scrollKey]: window.scrollY }, '');
  } catch {
    // Safari refuses past 100 calls in 30 seconds: the next pause in scrolling saves it
  }
};

/** The element the hash of the location names. */
export const placeInUrl = (): Nullable<HTMLElement> =>
  location.hash === '' ? null : document.getElementById(decode(location.hash.slice(1)));
