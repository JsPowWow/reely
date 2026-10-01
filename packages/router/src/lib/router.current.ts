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
