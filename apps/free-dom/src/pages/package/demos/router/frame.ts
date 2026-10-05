import { el } from './vanilla.dom';

import css from './router.module.css';

/** The frame of a demo app: its address in memory, a menu, and the place its pages are shown in. */
export interface Frame {
  app: HTMLElement;
  address: HTMLElement;
  page: HTMLElement;
}

export const frame = (menu: readonly HTMLAnchorElement[]): Frame => {
  const address = el('p', { className: css.address });
  const page = el('section', { className: css.page });
  const app = el(
    'div',
    { className: css.app },
    address,
    el(
      'div',
      { className: css.body },
      el('nav', { className: css.menu }, ...menu),
      page
    )
  );
  return { app, address, page };
};

/** An address as the frame prints it: its path and query. */
export const addressOf = ({ pathname, search }: URL): string =>
  `${pathname}${search}`;

/** Marks the link of the menu that goes to `path` as the page shown, and only that one. */
export const markCurrent = (
  menu: readonly HTMLAnchorElement[],
  path: string
): void => {
  for (const link of menu) {
    if (link.pathname === path) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  }
};
