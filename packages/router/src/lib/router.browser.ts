import { hasSome } from '@reely/basics';

import { currentPath, pageLoading, showLoading, showPath } from './router.current';
import { focusOn, headingIn } from './router.focus';
import { pageAddress } from './router.history';
import { takeOverLinks } from './router.links';
import { leavingEvent, navigate, navigationEvent } from './router.navigate';
import { keepScroll, keptScroll, placeInUrl } from './router.scroll';

import type { RouterHistory } from './router.history';

/**
 * The browser's own history: links of this site anywhere in the document, back and forward, and
 * `navigate`; each page opens where the reader had scrolled it, at the place its URL names, or at
 * the top. The query params in `keep` are settings, no part of a page.
 */
export const browserHistory = (keep: readonly string[] = []): RouterHistory => {
  let shown = '';

  return {
    url: () => new URL(location.href),
    path: currentPath,
    loading: pageLoading,
    loads: showLoading,
    navigate,
    follow: (moved) => {
      const listening = new AbortController();
      const { signal } = listening;
      const { scrollRestoration } = history;
      let saving: ReturnType<typeof setTimeout> | undefined;
      // the page shown keeps where it is scrolled, for a reload and for the way back to it
      const saveScroll = (): void => {
        if (pageAddress(location, keep) === shown) {
          keepScroll();
        }
      };
      // a link to a place on the page shown is the browser's to follow
      takeOverLinks(
        document,
        (link) => {
          if (pageAddress(link, keep) === shown && link.hash !== '') {
            return false;
          }
          navigate(link.href);
          return true;
        },
        signal
      );
      window.addEventListener('popstate', moved, { signal });
      window.addEventListener(navigationEvent, moved, { signal });
      window.addEventListener(
        'scroll',
        () => {
          clearTimeout(saving);
          saving = setTimeout(saveScroll, 100);
        },
        { signal, passive: true }
      );
      window.addEventListener('pagehide', saveScroll, { signal });
      window.addEventListener(leavingEvent, saveScroll, { signal });
      // pages load after a move, so the browser's own restoring would scroll the page before it is there
      history.scrollRestoration = 'manual';
      return () => {
        listening.abort();
        clearTimeout(saving);
        history.scrollRestoration = scrollRestoration;
      };
    },
    showing: (): void => {
      shown = pageAddress(location, keep);
      showPath(location.pathname);
    },
    arrive: (page, moved): void => {
      const place = placeInUrl();
      const scrolled = keptScroll();
      if (hasSome(scrolled)) {
        window.scrollTo(0, scrolled);
      } else if (hasSome(place)) {
        place.scrollIntoView();
      } else if (moved) {
        window.scrollTo(0, 0);
      }
      focusOn(place ?? (moved ? headingIn(page) : null));
    },
  };
};
