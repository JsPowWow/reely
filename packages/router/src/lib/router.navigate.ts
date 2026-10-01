// a move made by code: the page left is told first, then the new URL; `pushState` fires no `popstate`
export const leavingEvent = 'reely:leaving';
export const navigationEvent = 'reely:navigate';

export interface NavigateOptions {
  /** Takes the place of the current history entry, as a redirect does, instead of adding one. */
  replace?: boolean;
}

/** Goes to a URL of this site without loading the document; the router shows its page. */
export const navigate = (to: string | URL, { replace = false }: NavigateOptions = {}): void => {
  const url = new URL(to, location.href);
  if (url.href === location.href) {
    return;
  }
  if (replace) {
    history.replaceState(null, '', url);
  } else {
    window.dispatchEvent(new Event(leavingEvent));
    history.pushState(null, '', url);
  }
  window.dispatchEvent(new Event(navigationEvent));
};
