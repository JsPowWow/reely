import { onCleanup } from '@reely/signals';
import { isInstanceOf, isNil } from '@reely/utils';
import type { Nullable } from '@reely/utils';

const linkOf = (target: Nullable<EventTarget>): Nullable<HTMLAnchorElement> =>
  isInstanceOf(Element, target) ? target.closest('a') : null;

// a primary-button click without modifiers: the others open tabs and windows
const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.defaultPrevented && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

const opensHere = (link: HTMLAnchorElement): boolean =>
  (link.target === '' || link.target === '_self') && !link.hasAttribute('download') && link.origin === location.origin;

// takes over the plain clicks on the links of this site inside `root` that `follow` takes: it
// answers whether it went to the link's page, or leaves the click to the browser
export const takeOverLinks = (
  root: EventTarget,
  follow: (link: HTMLAnchorElement) => boolean,
  signal: AbortSignal
): void => {
  root.addEventListener(
    'click',
    (event) => {
      const link = isInstanceOf(MouseEvent, event) && isPlainClick(event) ? linkOf(event.target) : null;
      if (!isNil(link) && opensHere(link) && follow(link)) {
        event.preventDefault();
      }
    },
    { signal }
  );
};

/**
 * Sends the plain clicks on the links of this site inside `root` to `navigate`, with each link's own
 * `href`: what a `memoryHistory` needs to follow the links of its part of the page. Returns the stop;
 * called under an owner, it stops with it too.
 */
export const followLinks = (root: EventTarget, navigate: (to: string) => void): (() => void) => {
  const listening = new AbortController();
  const stop = (): void => listening.abort();
  takeOverLinks(
    root,
    (link) => {
      navigate(link.getAttribute('href') ?? '');
      return true;
    },
    listening.signal
  );
  onCleanup(stop);
  return stop;
};
