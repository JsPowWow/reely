import { reportUncaught, toErrorWithMessage } from '@reely/basics';
import { onCleanup } from '@reely/signals';
import { isInstanceOf, isNil } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { showPath } from './router.current';
import { leavingEvent, navigate, navigationEvent } from './router.navigate';
import { arrive, keepScroll } from './router.scroll';
import { createFlowSlot } from '../flow/flow.slot';

import type { Page, Routes } from './router.types';
import type { ReelyNode } from '../types/dommy.types';

export interface RouterProps {
  /** The app's routes: from `defineRoutes`, or any function of a pathname to a page. */
  routes: Routes;
  /** Required, so a page that fails to load or to render, and a path no route answers, still have a view. */
  catch: (error: Error) => ReelyNode;
}

const linkOf = (target: Nullable<EventTarget>): Nullable<HTMLAnchorElement> =>
  isInstanceOf(Element, target) ? target.closest('a') : null;

// a primary-button click without modifiers: the others open tabs and windows
const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.defaultPrevented && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

const opensHere = (link: HTMLAnchorElement): boolean =>
  (link.target === '' || link.target === '_self') && !link.hasAttribute('download') && link.origin === location.origin;

// routes answer a pathname; a new query is a new page as well, a new place on it is not
const pageAddress = ({ pathname, search }: Location | HTMLAnchorElement): string => `${pathname}${search}`;

/**
 * Shows the page of the current URL and keeps following it: a click on a link of this site, the
 * browser's back and forward, and `navigate` show the next page without loading the document. The
 * page shown stays until the next one has loaded; only the latest move counts.
 */
export const Router = ({ routes, catch: renderError }: RouterProps): DocumentFragment => {
  const slot = createFlowSlot('Router');
  const listening = new AbortController();
  const { scrollRestoration } = history;
  let latest = 0;
  let requested = pageAddress(location);
  let shown = '';
  let saving: ReturnType<typeof setTimeout> | undefined;

  const failure =
    (error: unknown): Page =>
    () =>
      renderError(toErrorWithMessage(error));

  const display = (page: Page, pathname: string): void => {
    shown = pageAddress(location);
    showPath(pathname);
    try {
      slot.show(page);
    } catch (error) {
      slot.show(failure(error));
    }
  };

  const show = (moved: boolean): void => {
    const turn = ++latest;
    const { pathname } = location;
    // a route that throws rejects like one whose page fails to load
    Promise.resolve()
      .then(() => routes(pathname))
      .then((page) => page ?? Promise.reject(new Error(`No route answers ${pathname}`)))
      .then((page) => page, failure)
      .then((page) => {
        if (turn === latest) {
          display(page, pathname);
          arrive(slot.nodes(), moved);
        }
      })
      .catch(reportUncaught);
  };

  const move = (): void => {
    const address = pageAddress(location);
    if (address === shown) {
      // back on the page shown, or a new place on it: a load still pending for another is dropped
      latest += 1;
      requested = address;
      arrive(slot.nodes(), true);
    } else if (address !== requested) {
      requested = address;
      show(true);
    }
  };

  const followLink = (event: MouseEvent): void => {
    const link = linkOf(event.target);
    // a link to a place on the page shown is the browser's to follow
    if (isNil(link) || !isPlainClick(event) || !opensHere(link) || (pageAddress(link) === shown && link.hash !== '')) {
      return;
    }
    event.preventDefault();
    navigate(link.href);
  };

  // the page shown keeps where it is scrolled, for a reload and for the way back to it
  const saveScroll = (): void => {
    if (pageAddress(location) === shown) {
      keepScroll();
    }
  };

  const { signal } = listening;
  document.addEventListener('click', followLink, { signal });
  window.addEventListener('popstate', move, { signal });
  window.addEventListener(navigationEvent, move, { signal });
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
  onCleanup(() => {
    listening.abort();
    clearTimeout(saving);
    latest += 1;
    history.scrollRestoration = scrollRestoration;
  });

  show(false);
  return slot.fragment;
};
