import { forEachSettled } from '@reely/basics';
import { signal } from '@reely/signals';

import { focusOn, headingIn } from './router.focus';
import { anyOrigin } from './router.history';

import type { RouterHistory } from './router.history';

/**
 * A history kept in memory, for a router inside part of the page (a widget, a dialog, a demo): it
 * starts at `start` and leaves the document's URL alone. It follows the links `followLinks` gives it.
 */
export const memoryHistory = (start = '/'): RouterHistory => {
  let now = new URL(start, anyOrigin);
  const shown = signal(now.pathname);
  const loading = signal(false);
  const movers = new Set<() => void>();

  return {
    url: () => new URL(now),
    path: () => shown.value,
    loading: () => loading.value,
    loads: (value): void => {
      loading.value = value;
    },
    navigate: (to): void => {
      now = new URL(to, now);
      forEachSettled(movers, (moved) => moved());
    },
    follow: (moved) => {
      movers.add(moved);
      return (): void => void movers.delete(moved);
    },
    showing: (): void => {
      shown.value = now.pathname;
    },
    arrive: (page, moved): void => {
      if (moved) {
        focusOn(headingIn(page));
      }
    },
  };
};
