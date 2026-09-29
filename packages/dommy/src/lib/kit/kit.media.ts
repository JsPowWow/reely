import { isSomeFunction } from '@reely/utils';

import { listen } from './kit.listen';
import { computed, signal } from '../reactive/preact-like/preact-like.signal';

import type { Computed } from '../reactive/preact-like/preact-like.signal';

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
