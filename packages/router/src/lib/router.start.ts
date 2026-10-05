import { reportUncaught, toErrorWithMessage } from '@reely/basics';
import { batch, onCleanup } from '@reely/signals';
import type { Nullable } from '@reely/utils';

import { browserHistory } from './router.browser';
import { pageAddress } from './router.history';

import type { RouterHistory, Shown } from './router.history';
import type { NavigateOptions } from './router.navigate';
import type { Routes } from './router.types';

export interface RouterOptions<Page> {
  /** Puts a page on screen; returns the element it is shown in, or its nodes, whose heading a move focuses. */
  show: (page: Page) => Shown;
  /** The page for what went wrong: a route that fails or fails to load, an address no route answers, a page that fails to show. */
  fail: (error: Error) => Page;
  /** Where the addresses come from: the browser's history when left out, or a `memoryHistory`. */
  history?: RouterHistory;
  /**
   * Query params that are settings of the app, not pages, such as `lang`: routes never see them, a
   * change to one is no move, and every move keeps them in the address.
   */
  keep?: readonly string[];
}

export interface Router {
  /** The path of the page shown, read like a signal: an effect that reads it follows every move. */
  path: () => string;
  /** Whether a page is loading, read like a signal; the page shown stays until it has loaded. */
  loading: () => boolean;
  /** Goes to an address of this router, as a click on a link to it does. */
  navigate: (to: string | URL, options?: NavigateOptions) => void;
  /** Stops following moves; a router started under an owner stops with it too. */
  stop: () => void;
}

/**
 * Shows the page of the current address and keeps following it: a click on a link of this site, the
 * browser's back and forward, and `navigate` show the next page without loading the document. The
 * page shown stays until the next one has loaded; only the latest move counts.
 */
export const startRouter = <Page>(
  routes: Routes<Page>,
  { show, fail, keep = [], history = browserHistory(keep) }: RouterOptions<NoInfer<Page>>
): Router => {
  const addressOf = (url: URL): string => pageAddress(url, keep);
  // the address followed last, with its settings and its place
  let last = history.url();
  let latest = 0;
  let requested = addressOf(last);
  let shown = '';
  // the address whose page failed: a move to it again loads it again, as when it failed offline
  let failedAt = '';
  let onScreen: Shown = [];

  const failure = (error: unknown): Page => fail(toErrorWithMessage(error));

  const display = (page: Page, url: URL, moved: boolean, failed: boolean): void => {
    shown = addressOf(url);
    failedAt = failed ? shown : '';
    batch(() => {
      history.loads(false);
      history.showing();
    });
    try {
      onScreen = show(page);
    } catch (error) {
      failedAt = shown;
      onScreen = show(failure(error));
    }
    history.arrive(onScreen, moved);
  };

  const load = (moved: boolean): void => {
    const turn = ++latest;
    const url = history.url();
    let failed = false;
    history.loads(true);
    // a route that throws rejects like one whose page fails to load
    Promise.resolve()
      .then(() => routes(addressOf(url)))
      .then((page) => page ?? Promise.reject(new Error(`No route answers ${url.pathname}`)))
      .catch((error: unknown) => {
        failed = true;
        return failure(error);
      })
      .then((page) => {
        if (turn === latest) {
          display(page, url, moved, failed);
        }
      })
      .catch((error: unknown) => {
        // even the failure page failed: nothing more is coming for this move
        if (turn === latest) {
          history.loads(false);
        }
        reportUncaught(error);
      });
  };

  const move = (): void => {
    const url = history.url();
    // a move that leaves a setting out takes it along: settings stay from page to page
    const dropped = keep.filter((name) => !url.searchParams.has(name) && last.searchParams.has(name));
    if (dropped.length > 0) {
      dropped.forEach((name) => url.searchParams.set(name, last.searchParams.get(name) ?? ''));
      history.navigate(url, { replace: true });
      return;
    }
    const address = addressOf(url);
    const settingOnly = address === addressOf(last) && url.hash === last.hash;
    last = url;
    if (address === failedAt) {
      requested = address;
      load(true);
      return;
    }
    if (settingOnly) {
      return;
    }
    if (address === shown) {
      // back on the page shown, or a new place on it: a load still pending for another is dropped
      latest += 1;
      requested = address;
      history.loads(false);
      history.arrive(onScreen, true);
    } else if (address !== requested) {
      requested = address;
      load(true);
    }
  };

  let unfollow: Nullable<() => void> = history.follow(move);
  const stop = (): void => {
    unfollow?.();
    unfollow = null;
    latest += 1;
    history.loads(false);
  };
  onCleanup(stop);
  load(false);

  return { path: history.path, loading: history.loading, navigate: history.navigate, stop };
};
