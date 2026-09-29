import { isSomeFunction } from '@reely/utils';

import { listen } from './kit.listen';
import { computed, signal } from '../reactive/preact-like/preact-like.signal';

import type { Computed } from '../reactive/preact-like/preact-like.signal';

/**
 * Whether a media query matches, as a computed that follows it: a phone layout that turns with
 * the phone, `(prefers-reduced-motion: reduce)` that changes while the page is open. It stops
 * listening with the render that created it. Where there is no `matchMedia` (jsdom), it is `false`.
 *
 * @param {string} query - A media query, as `matchMedia` takes it.
 * @returns {Computed<boolean>} Whether the query matches now.
 */
export const media = (query: string): Computed<boolean> => {
  if (!isSomeFunction(window.matchMedia)) {
    return computed(() => false);
  }
  const list = window.matchMedia(query);
  const matches = signal(list.matches);
  listen(list, 'change', (event) => {
    matches.value = event.matches;
  });
  return computed(() => matches.value);
};
