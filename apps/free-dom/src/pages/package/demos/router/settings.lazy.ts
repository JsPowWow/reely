import { defineRoutes, followLinks, href, memoryHistory, startRouter } from '@reely/router';
import { effect } from '@reely/signals';

import { addressOf, frame, markCurrent } from './frame';
import { el } from './vanilla.dom';
import examples from '../../../../demo/examples.module.css';

import css from './router.module.css';

// a page here is the function that makes its view
type Page = () => Node;

const paths = { tab: '/settings/:tab' } as const;

const tabs = ['profile', 'billing', 'notifications', 'reports'] as const;

// stands in for `import('./billing.page')`: the chunk arrives after `ms`
const chunk = <T>(ms: number, page: T): Promise<T> => new Promise((loaded) => setTimeout(loaded, ms, page));

const tabPage =
  (title: string, text: string): Page =>
  () =>
    el('div', {}, el('h2', {}, title), el('p', {}, text));

export const LazySettings = (): Node => {
  const menu = tabs.map((tab) => el('a', { href: href(paths.tab, { tab }) }, tab));
  const { app, address, page } = frame(menu);
  const log = el('ol', { className: css.log });
  const note = (line: string): void => void log.append(el('li', {}, line));
  const loaded =
    (tab: string) =>
    (view: Page): Page => {
      note(`${tab} loaded`);
      return view;
    };
  const history = memoryHistory(href(paths.tab, { tab: 'profile' }));
  // the links of the frame go to this history, not to the site's
  followLinks(app, history.navigate);

  const routes = defineRoutes({
    [paths.tab]: ({ tab }) => {
      switch (tab) {
        case 'profile':
          return tabPage('Profile', 'Shipped with the app: no wait.');
        case 'billing':
          return chunk(1500, tabPage('Billing', 'Its own chunk, 1.5 s away.')).then(loaded(tab));
        case 'notifications':
          return chunk(500, tabPage('Notifications', 'Its own chunk, 0.5 s away.')).then(loaded(tab));
        case 'reports':
          return chunk(700, undefined).then(() => Promise.reject(new Error('The reports chunk did not load.')));
        default:
          return undefined;
      }
    },
  });

  const router = startRouter(routes, {
    history,
    show: (view) => {
      address.textContent = addressOf(history.url());
      note(`${address.textContent} shown`);
      page.replaceChildren(view());
      return page;
    },
    fail:
      (error): Page =>
      () =>
        el('div', {}, el('h2', {}, 'Could not open the page'), el('p', { className: css.failed }, error.message)),
  });

  effect(() => markCurrent(menu, router.path()));
  // the page shown stays while the next one loads: the bar under the address says one is coming
  effect(() => app.setAttribute('aria-busy', String(router.loading())));

  return el('div', { className: examples.stack }, app, log);
};
