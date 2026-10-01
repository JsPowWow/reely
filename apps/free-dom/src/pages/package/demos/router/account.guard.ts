import { defineRoutes, followLinks, href, memoryHistory, startRouter } from '@reely/router';
import { effect, signal } from '@reely/signals';

import { addressOf, frame, markCurrent } from './frame';
import { el } from './vanilla.dom';

import css from './router.module.css';

type Page = () => Node;

const paths = { home: '/', orders: '/orders', account: '/account', login: '/login' } as const;

const page =
  (title: string, ...content: (Node | string)[]): Page =>
  () =>
    el('div', {}, el('h2', {}, title), ...content);

const button = (label: string, onclick: () => void): HTMLButtonElement =>
  el('button', { type: 'button', onclick }, label);

export const AccountGuard = (): Node => {
  const menu = [
    el('a', { href: href(paths.home) }, 'Home'),
    el('a', { href: href(paths.orders) }, 'Orders'),
    el('a', { href: href(paths.account) }, 'Account'),
  ];
  const { app, address, page: place } = frame(menu);
  const history = memoryHistory(href(paths.home));
  // the links of the frame go to this history, not to the site's
  followLinks(app, history.navigate);
  const user = signal<string | undefined>(undefined);

  // a guard is a function around a route's answer: signed out, the reader is sent to sign in, and
  // the page they asked for waits in the address
  const signedIn = (from: string, answer: (name: string) => Page): Page | undefined => {
    const name = user.value;
    if (name !== undefined) {
      return answer(name);
    }
    history.navigate(`${href(paths.login)}?${new URLSearchParams({ next: from })}`, { replace: true });
    return undefined;
  };

  const routes = defineRoutes({
    [paths.home]: () => page('Welcome', el('p', {}, 'Orders and Account need you to sign in.')),
    [paths.orders]: () =>
      signedIn(paths.orders, (name) => page(`${name}’s orders`, el('p', {}, '#1042, a beech chair, ships on Monday.'))),
    [paths.account]: () =>
      signedIn(paths.account, (name) =>
        page(
          name,
          el('p', {}, 'Signed in.'),
          button('Sign out', () => {
            user.value = undefined;
            history.navigate(href(paths.home));
          })
        )
      ),
    [paths.login]: (_params, query) => {
      const next = query.get('next') ?? href(paths.home);
      return page(
        'Sign in',
        el('p', {}, `Then you go on to ${next}.`),
        button('Sign in as Ana', () => {
          user.value = 'Ana';
          // where the reader was going; in the browser, `replace` keeps the sign-in page out of Back
          history.navigate(next, { replace: true });
        })
      );
    },
  });

  const router = startRouter(routes, {
    history,
    show: (view) => {
      address.textContent = addressOf(history.url());
      place.replaceChildren(view());
      return place;
    },
    fail: (error) => page('Something went wrong', el('p', { className: css.failed }, error.message)),
  });

  effect(() => markCurrent(menu, router.path()));

  return app;
};
