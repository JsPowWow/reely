import type { Nullable } from '@reely/utils';
import { isInstanceOf, isNil } from '@reely/utils';

const findLink = (target: Nullable<EventTarget>): Nullable<HTMLAnchorElement> =>
  isInstanceOf(Element, target) ? target.closest('a') : null;

/** A primary-button click without modifiers: the others open tabs and windows. */
const isPlainClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.defaultPrevented && !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);

const opensInPlace = (link: HTMLAnchorElement): boolean =>
  (link.target === '' || link.target === '_self') && !link.hasAttribute('download') && link.origin === location.origin;

/** A link to a place on the page already shown: the browser scrolls to it, nothing is redrawn. */
const isPlaceOnPage = (link: HTMLAnchorElement): boolean =>
  link.pathname === location.pathname && link.search === location.search && link.hash !== '';

/** Follows same-site links and back/forward without a reload; returns the function that stops it. */
export const navigateInPage = (render: (pathname: string) => void): VoidFunction => {
  const controller = new AbortController();
  let shownPathname = location.pathname;
  const show = (): void => {
    shownPathname = location.pathname;
    render(shownPathname);
  };

  document.addEventListener(
    'click',
    (event) => {
      const link = findLink(event.target);
      if (isNil(link) || !isPlainClick(event) || !opensInPlace(link) || isPlaceOnPage(link)) {
        return;
      }
      event.preventDefault();
      if (link.href !== location.href) {
        history.pushState(null, '', link.href);
      }
      show();
    },
    { signal: controller.signal }
  );
  // moving between places on the same page keeps the page
  window.addEventListener(
    'popstate',
    () => {
      if (location.pathname !== shownPathname) {
        show();
      }
    },
    { signal: controller.signal }
  );

  return () => controller.abort();
};
