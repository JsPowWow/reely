import type { NavigateOptions } from './router.navigate';

/** What `show` returns: the element a page is shown in, or the nodes it put on screen. */
export type Shown = Node | readonly Node[];

/**
 * Where a router's addresses come from and how it moves between them: the browser's history, or
 * `memoryHistory` for a router inside a part of the page.
 */
export interface RouterHistory {
  /** The address now. */
  url: () => URL;
  /** The path of the page shown, read like a signal. */
  path: () => string;
  /** Whether the next page is loading, read like a signal. */
  loading: () => boolean;
  /** The router says a page for the address now starts loading, or that loading is over. */
  loads: (loading: boolean) => void;
  /** Goes to an address, as a click on a link to it does. */
  navigate: (to: string | URL, options?: NavigateOptions) => void;
  /** Calls `moved` after each move until the stop it returns. */
  follow: (moved: () => void) => () => void;
  /** Takes the address now for the page about to be shown, so the page reads its path while it renders. */
  showing: () => void;
  /** Brings the reader to the page just shown; `moved` is false for the first page. */
  arrive: (shown: Shown, moved: boolean) => void;
}

// routes answer a path and its query; a new query is a new page as well, a new place on it is not
export const pageAddress = ({ pathname, search }: URL | Location | HTMLAnchorElement): string => `${pathname}${search}`;

/** Any address parses against it where only its path and query matter, never its origin. */
export const anyOrigin = 'https://reely.invalid';
