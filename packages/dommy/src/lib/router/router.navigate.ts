// a move made by code: the page left is told first, then the new URL; `pushState` fires no `popstate`
export const leavingEvent = 'reely:leaving';
export const navigationEvent = 'reely:navigate';

/** Goes to a URL of this site without loading the document; the `Router` shows its page. */
export const navigate = (to: string | URL): void => {
  const url = new URL(to, location.href);
  if (url.href === location.href) {
    return;
  }
  window.dispatchEvent(new Event(leavingEvent));
  history.pushState(null, '', url);
  window.dispatchEvent(new Event(navigationEvent));
};
