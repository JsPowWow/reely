import { onCleanup } from '@reely/signals';
import { isInstanceOf, isNil } from '@reely/utils';
import type { Nullable } from '@reely/utils';

// the HTML link clicked, inside a shadow root too; an `<a>` of SVG is no link the router follows
const linkOf = (event: Event): Nullable<HTMLAnchorElement> => {
  const [target] = event.composedPath();
  const link = isInstanceOf(Element, target) ? target.closest('a') : null;
  return isInstanceOf(HTMLAnchorElement, link) ? link : null;
};

// a primary-button click without modifiers: the others open tabs and windows
const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.defaultPrevented && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

// `rel="external"` marks a link of this site the server answers (a file, a page of another app)
const opensHere = (link: HTMLAnchorElement): boolean =>
  (link.target === '' || link.target === '_self') &&
  !link.hasAttribute('download') &&
  !link.relList.contains('external') &&
  link.origin === location.origin;

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
      const link = isInstanceOf(MouseEvent, event) && isPlainClick(event) ? linkOf(event) : null;
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
