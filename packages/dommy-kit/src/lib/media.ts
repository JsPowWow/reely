import { isSomeFunction } from '@reely/basics';
import { computed, signal } from '@reely/signals';
import type { Computed } from '@reely/signals';

import { listen } from './listen';

/**
 * Whether a media query matches, following it until the render that created it is disposed;
 * `false` where there is no `matchMedia` (jsdom).
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
