import { signal } from '@reely/signals';
import type { Signal } from '@reely/signals';

// one location per document, so one path shown; the signal is made on first use
let shown: Signal<string> | undefined;

const shownPath = (): Signal<string> => (shown ??= signal(location.pathname));

/**
 * The path of the page the browser's router shows, read like a signal: a binding or effect that reads it
 * follows every move, as a menu's `aria-current` does.
 */
export const currentPath = (): string => shownPath().value;

// the Router tells `currentPath` the path of each page it shows
export const showPath = (path: string): void => {
  shownPath().value = path;
};

// and one page loading at a time
let loading: Signal<boolean> | undefined;

const loadingPage = (): Signal<boolean> => (loading ??= signal(false));

/**
 * Whether the browser's router is loading the next page, read like a signal: the page shown stays
 * until it has loaded, so a progress bar anywhere in the app says one is coming.
 */
export const pageLoading = (): boolean => loadingPage().value;

export const showLoading = (value: boolean): void => {
  loadingPage().value = value;
};
