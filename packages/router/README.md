# @reely/router

A small typed router for any web app, with no framework: path patterns typed into their params, pages that load on demand, links and the back button taken over, and every page opened where the reader expects it, scrolled and focused. You decide what a page is and how it gets on screen. Built on [`@reely/signals`](https://www.npmjs.com/package/@reely/signals), so the path shown and the loading state are signals; tree-shakeable, so `href` alone ships 0.2 kB.

```sh
npm i @reely/router
```

`@reely/signals` is a peer dependency, which npm installs with it: an app holds one signal graph, shared with `@reely/dommy` and anything else built on it.

## A vanilla app in one file

```ts
import { defineRoutes, startRouter } from '@reely/router';

const main = document.querySelector('main') ?? document.body;

const heading = (text: string): HTMLElement => Object.assign(document.createElement('h1'), { textContent: text });

const routes = defineRoutes({
  '/': () => () => heading('Inbox'),
  '/messages/:id':
    ({ id }) =>
    () =>
      heading(`Message ${id}`),
  '/*rest':
    ({ rest }) =>
    () =>
      heading(`Nothing at /${rest}`),
});

startRouter(routes, {
  show: (page) => {
    main.replaceChildren(page());
    return main;
  },
  fail: (error) => () => heading(error.message),
});
```

That is the whole setup. Links stay plain `<a href="/messages/42">`: the router takes over a plain click on any link of the site, and back, forward and a reload work as on a site of documents, without loading one.

- A **route** is a path pattern with the function that answers it. `:id` takes one segment, `*rest` the rest of the path; the params arrive decoded and typed from the pattern, so `({ topic })` on `'/messages/:id'` does not compile.
- A **page** is whatever your app shows: here a function that makes the view, but an element or `{ title, view }` work as well. Its type is inferred from what the routes answer, and `show` and `fail` are checked against it.
- `show` puts a page on screen and returns the element it is in (or its nodes); after a move, the page's `h1` gets the focus, so a screen reader starts reading the new page.
- `fail` gives the page for whatever went wrong: a route that throws or fails to load, an address no route answers, a page that throws in `show`. A move to that address again, a click on the same link included, tries its page once more, so a chunk that failed offline loads once the reader is back online.

## Routes

Patterns are absolute paths from the site's root, with no base path, and may be written in any script (`/о-нас`, `/café`). Routes are tried in order, and one that answers `undefined` passes the address on to the next, so a route can check its params and leave the rest to a page for unknown paths. A route may answer with a promise of its page, so the page behind `import()` ships in its own chunk and loads when it is first opened. The second argument is the query.

```ts
import { defineRoutes } from '@reely/router';

interface Page {
  title: string;
  view: () => Node;
}

interface Product {
  name: string;
}

declare const catalogue: Map<string, Product>;
declare const productPage: (product: Product) => Page;
declare const searchPage: (words: string, sort: string) => Page;
declare const loadSettings: () => Promise<{ settingsPage: Page }>;
declare const notFoundPage: (path: string) => Page;

export const routes = defineRoutes({
  // an unknown slug passes on to the page for unknown paths
  '/products/:slug': ({ slug }) => {
    const product = catalogue.get(slug);
    return product && productPage(product);
  },
  '/search': (_params, query) => searchPage(query.get('q') ?? '', query.get('sort') ?? 'relevance'),
  // its own chunk, loaded when /settings is first opened
  '/settings': () => loadSettings().then(({ settingsPage }) => settingsPage),
  '/*rest': ({ rest }) => notFoundPage(`/${rest}`),
});
```

`routes` is a plain function, `(address) => Promise<Page | undefined>`, so a test calls it without a browser: `await routes('/search?q=lamp')`.

## Links and moves

A route's pattern is its name. Keep the patterns in one object, and `href` fills one in for a link, typed and encoded, an absolute path as the pattern is, so a link and the route it opens share one path:

```ts
import { href, navigate } from '@reely/router';

const paths = { message: '/messages/:id', folder: '/folders/*path' } as const;

const link = Object.assign(document.createElement('a'), {
  href: href(paths.message, { id: '42' }), // '/messages/42'
  textContent: 'Your order has shipped',
});
document.body.append(link);

href(paths.folder, { path: 'work/2026 plans' }); // '/folders/work/2026%20plans'

// after the form is sent, from code
navigate(href(paths.message, { id: '43' }));
// a redirect takes the place of the entry it leaves, so back does not return to it
navigate('/login?next=/account', { replace: true });
```

- The router takes over a plain left click on a link of this site, inside an open shadow root too. A click with a modifier key or another button, a link with `target="_blank"` or `download`, a link marked `rel="external"` (a file or a page the server answers), a link to another site, and a link to a place on the page shown stay the browser's.
- A new query (`?sort=price`) shows the page again; a new `#place` on the page shown only scrolls to it.
- `navigate` to the URL already shown adds no history entry.

A guard is a route that sends the reader elsewhere instead of answering:

```ts
import { defineRoutes, navigate } from '@reely/router';

declare const signedIn: () => boolean;
declare const accountPage: () => Node;
declare const loginPage: (next: string) => () => Node;

export const routes = defineRoutes({
  '/account': () => {
    if (signedIn()) {
      return accountPage;
    }
    navigate('/login?next=/account', { replace: true });
    return undefined;
  },
  '/login': (_params, query) => loginPage(query.get('next') ?? '/'),
});
```

## Settings that stay in the address

Some query params aren't pages at all: the language, the currency, a theme. Name them in `keep`, and the router treats them as settings of the app. Routes never see them; a link without one takes it along, so the reader keeps their language from page to page; and a change to one alone is no move, so nothing is shown again, scrolled or refocused.

```ts
import { defineRoutes, navigate, startRouter } from '@reely/router';

const main = document.querySelector('main') ?? document.body;
const heading = (text: string): HTMLElement => Object.assign(document.createElement('h1'), { textContent: text });

// `/pricing?lang=de` and a link to `/faq` from it lead to `/faq?lang=de`; no route reads `lang`
startRouter(
  defineRoutes({
    '/pricing': () => () => heading('Pricing'),
    '/faq': () => () => heading('FAQ'),
  }),
  {
    keep: ['lang'],
    show: (page) => {
      main.replaceChildren(page());
      return main;
    },
    fail: (error) => () => heading(error.message),
  }
);

// switching the language: the same page, the address now says so, and a copied link opens in German
const address = new URL(location.href);
address.searchParams.set('lang', 'de');
navigate(address, { replace: true });
```

The page reads its setting wherever it likes (`new URL(location.href).searchParams.get('lang')`, or a signal it keeps); the router only promises that the address goes on naming it.

`keep` fills in only a setting the address leaves out. Back to an entry made with an older value brings that value back; an app that wants its current one everywhere writes it into the address after each move, as the [free-dom site](https://reely-free-dom.netlify.app) does:

```ts
import { effect } from '@reely/signals';
import { currentPath, navigate } from '@reely/router';

declare const language: () => string; // the language shown now, read like a signal

effect(() => {
  currentPath();
  const address = new URL(location.href);
  address.searchParams.set('lang', language());
  navigate(address, { replace: true });
});
```

A move cannot drop a kept setting either: set it to empty (`?lang=`) instead.

## The path shown, and the page loading

`startRouter` returns the router: `path()` and `loading()` read like signals, so an effect that reads them follows every move.

```ts
import { effect } from '@reely/signals';
import { startRouter } from '@reely/router';
import type { Routes } from '@reely/router';

declare const routes: Routes<() => Node>;

const main = document.querySelector('main') ?? document.body;
const menu = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav a'));
const bar = document.querySelector('progress') ?? document.createElement('progress');

const router = startRouter(routes, {
  show: (page) => {
    main.replaceChildren(page());
    return main;
  },
  fail: (error) => () => document.createTextNode(error.message),
});

// the menu marks the page shown
effect(() => {
  for (const link of menu) {
    link.ariaCurrent = link.pathname === router.path() ? 'page' : null;
  }
});

// the page shown stays until the next one has loaded: say that one is coming
effect(() => {
  bar.hidden = !router.loading();
  main.ariaBusy = String(router.loading());
});
```

Only the latest move counts: a page still loading when the reader clicks another link is dropped. `currentPath()` and `pageLoading()` read the same for the browser's router from anywhere in the app, without the router at hand: a progress bar in the header needs only `pageLoading()`.

## Scroll and focus

The browser's router opens each page the way the reader expects:

- a new page at the top, or at the place its URL names (`/faq#returns`), with focus on its heading or on that place;
- back, forward and a reload where the reader had scrolled it, kept in the history entry's state;
- the browser's own scroll restoring stays off while the router runs, since a page that loads after the move would be scrolled before it is there.

## A router inside part of the page

A widget, a dialog or a help panel can have pages of its own and leave the address bar alone. `memoryHistory(start)` keeps the address in memory; `followLinks(root, navigate)` hands it the plain clicks on the links inside `root`, each read against its own address (so `href="7"` on `/orders/3` goes to `/orders/7`). It keeps no Back stack, so `replace` changes nothing there:

```ts
import { defineRoutes, followLinks, href, memoryHistory, startRouter } from '@reely/router';

const panel = document.createElement('aside');
const paths = { topics: '/', topic: '/topics/:slug' } as const;
const text = (content: string): Node => document.createTextNode(content);

const help = memoryHistory(paths.topics);
followLinks(panel, help.navigate);

startRouter(
  defineRoutes({
    [paths.topics]: () => () => text('How can we help?'),
    [paths.topic]:
      ({ slug }) =>
      () =>
        text(`About ${slug}`),
  }),
  {
    history: help,
    show: (page) => {
      panel.replaceChildren(page());
      return panel;
    },
    fail: (error) => () => text(error.message),
  }
);

help.navigate(href(paths.topic, { slug: 'returns' })); // from code, the same way
console.log(help.path(), help.loading()); // the path shown and the next page loading, read like signals
```

After a move, the page's `h1` gets the focus, or its first heading of any level when it has none: a widget's pages start at `h2`. Scrolling is the page's own: a `memoryHistory` scrolls nowhere and ignores a `#place`.

## Moves from code

`navigate` is a move like a click, so keys, forms and timers move the router too:

```ts
import { href, navigate } from '@reely/router';

const paths = { photo: '/photos/:id', album: '/photos' } as const;
const photos = ['harbour', 'meadow', 'dunes'];

declare const shownPhoto: () => string; // the id of the photo shown, from the router's path()

document.addEventListener('keydown', (event) => {
  const next = photos[(photos.indexOf(shownPhoto()) + 1) % photos.length] ?? '';
  if (event.key === 'ArrowRight') {
    navigate(href(paths.photo, { id: next }));
  } else if (event.key === 'Escape') {
    navigate(href(paths.album));
  }
});

const search = document.querySelector('form');
search?.addEventListener('submit', (event) => {
  event.preventDefault();
  const words = new FormData(search).get('q');
  navigate(`/search?${new URLSearchParams({ q: String(words ?? '') })}`);
});
```

## Stopping

`router.stop()` stops following links and moves and gives scrolling back to the browser. A router started under an owner of `@reely/signals` (a render of `@reely/dommy`, an effect run, `withOwner`) stops with it, and so does `followLinks`.

## With dommy

[`@reely/dommy/router`](https://www.npmjs.com/package/@reely/dommy) puts this router in a component, and re-exports the rest: `<Router routes={routes} catch={...} />` renders each page under its own owner and takes it down at the next move, and takes `keep` as well. Given a `history`, it runs inside a widget:

```tsx
import { defineRoutes, followLinks, href, memoryHistory, Router } from '@reely/dommy/router';

const paths = { topics: '/help', topic: '/help/:slug' } as const;

const routes = defineRoutes({
  [paths.topics]: () => () => <h2>How can we help?</h2>,
  [paths.topic]:
    ({ slug }) =>
    () =>
      <h2>About {slug}</h2>,
});

export const HelpWidget = (): Node => {
  const help = memoryHistory(paths.topics);
  const widget = (
    <aside>
      <nav>
        {['returns', 'delivery'].map((slug) => (
          <a
            href={href(paths.topic, { slug })}
            aria={{ ariaCurrent: () => (help.path() === href(paths.topic, { slug }) ? 'page' : null) }}
          >
            {slug}
          </a>
        ))}
      </nav>
      <Router routes={routes} history={help} catch={(error) => <p role='alert'>{error.message}</p>} />
    </aside>
  );
  followLinks(widget, help.navigate);
  return widget;
};
```

## API

- `defineRoutes(table)`: the routes of a table of path patterns, `(address) => Promise<Page | undefined>`.
- `startRouter(routes, { show, fail, history, keep })`: shows the page of the current address and keeps following it; returns `{ path, loading, navigate, stop }`. `keep` names the query params that are settings, not pages.
- `href(pattern, params)`: a URL from a pattern, typed and encoded.
- `navigate(to, { replace })`: goes to a URL of this site in the browser; `replace` takes the current entry's place, and on the same path keeps where the page was scrolled.
- `currentPath()` and `pageLoading()`: the path the browser's router shows and whether the next page is loading, read like signals.
- `memoryHistory(start)`: a history in memory, for a router inside part of the page; `path()`, `loading()` and `navigate()` on it.
- `followLinks(root, navigate)`: sends the plain clicks on the links inside `root` to `navigate`; returns the stop.
- Types: `Routes`, `RouteTable`, `ParamsOf`, `HrefParams`, `PageOf`, `Router`, `RouterOptions`, `Shown`, `RouterHistory`, `NavigateOptions`.

## License

MIT
