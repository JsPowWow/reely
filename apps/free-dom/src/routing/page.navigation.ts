import type { Nullable } from '@reely/utils';
import { isInstanceOf, isNil } from '@reely/utils';

const findLink = (target: Nullable<EventTarget>): Nullable<HTMLAnchorElement> =>
  isInstanceOf(Element, target) ? target.closest('a') : null;

/** A primary-button click without modifiers: the others open tabs and windows. */
const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.defaultPrevented && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

const opensInPlace = (link: HTMLAnchorElement): boolean =>
  (link.target === '' || link.target === '_self') && !link.hasAttribute('download') && link.origin === location.origin;

/**
 * Follows same-site links without reloading the document: the URL goes to the history and
 * `render` draws its page; back and forward draw the page of their history entry. Clicks that
 * open a tab, a window, a download or another site are left to the browser.
 *
 * @param {(pathname: string) => void} render - Draws the page for a pathname.
 * @returns {VoidFunction} Stops following links.
 */
export const navigateInPage = (render: (pathname: string) => void): VoidFunction => {
  const controller = new AbortController();

  document.addEventListener(
    'click',
    (event) => {
      const link = findLink(event.target);
      if (isNil(link) || !isPlainClick(event) || !opensInPlace(link)) {
        return;
      }
      event.preventDefault();
      if (link.href !== location.href) {
        history.pushState(null, '', link.href);
      }
      render(location.pathname);
    },
    { signal: controller.signal }
  );
  window.addEventListener('popstate', () => render(location.pathname), { signal: controller.signal });

  return () => controller.abort();
};
