import { defineRoutes, followLinks, href, memoryHistory, startRouter } from '@reely/router';

import { addressOf, frame } from './frame';
import { el } from './vanilla.dom';

import css from './router.module.css';

// a page here is the element itself, made when its route answers
type Page = HTMLElement;

const paths = { home: '/', search: '/search', product: '/products/:slug' } as const;

const catalogue = [
  { slug: 'oak-desk-lamp', name: 'Oak desk lamp', kind: 'lamp', price: 59 },
  { slug: 'brass-floor-lamp', name: 'Brass floor lamp', kind: 'lamp', price: 149 },
  { slug: 'paper-pendant-lamp', name: 'Paper pendant lamp', kind: 'lamp', price: 35 },
  { slug: 'beech-chair', name: 'Beech chair', kind: 'chair', price: 89 },
  { slug: 'reading-armchair', name: 'Reading armchair', kind: 'chair', price: 420 },
];

type Product = (typeof catalogue)[number];

const sorts = ['relevance', 'price', 'name'] as const;

const orders: Readonly<Record<string, (a: Product, b: Product) => number>> = {
  price: (a, b) => a.price - b.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

// the search lives in the address: a link to it is the search itself
const searchHref = (words: string, sort = 'relevance'): string =>
  `${href(paths.search)}?${new URLSearchParams({ q: words, sort })}`;

export const ShopSearch = (): Node => {
  const menu = [
    el('a', { href: href(paths.home) }, 'Shop'),
    el('a', { href: searchHref('lamp') }, 'Lamps'),
    el('a', { href: searchHref('chair', 'price') }, 'Chairs by price'),
  ];
  const { app, address, page } = frame(menu);
  const history = memoryHistory(href(paths.home));
  // the links of the frame go to this history, not to the site's
  followLinks(app, history.navigate);

  const searchForm = (words = '', sort = 'relevance'): HTMLFormElement => {
    const input = el('input', { type: 'search', name: 'q', value: words, placeholder: 'lamp, chair…' });
    input.setAttribute('aria-label', 'Search the shop');
    const order = el('select', { name: 'sort' }, ...sorts.map((each) => el('option', { value: each }, each)));
    order.value = sort;
    order.setAttribute('aria-label', 'Sort by');
    const form = el('form', { className: css.search }, input, order, el('button', { type: 'submit' }, 'Search'));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      history.navigate(searchHref(input.value.trim(), order.value));
    });
    return form;
  };

  const routes = defineRoutes({
    [paths.home]: (): Page => el('div', {}, el('h2', {}, 'Find something for your home'), searchForm()),
    [paths.search]: (_params, query): Page => {
      const words = query.get('q') ?? '';
      const sort = query.get('sort') ?? 'relevance';
      const found = catalogue
        .filter(({ name, kind }) => `${name} ${kind}`.toLowerCase().includes(words.toLowerCase()))
        .sort(orders[sort] ?? ((): number => 0));
      return el(
        'div',
        {},
        el('h2', {}, `${found.length} found for “${words}”`),
        searchForm(words, sort),
        el(
          'p',
          { className: css.sorts },
          'Sort:',
          ...sorts.map((each) => el('a', { href: searchHref(words, each) }, each))
        ),
        el(
          'ul',
          { className: css.rows },
          ...found.map(({ slug, name, price }) =>
            el('li', {}, el('a', { href: href(paths.product, { slug }) }, name, el('small', {}, `€${price}`)))
          )
        )
      );
    },
    [paths.product]: ({ slug }) => {
      const product = catalogue.find((each) => each.slug === slug);
      return (
        product &&
        el(
          'div',
          {},
          el('h2', {}, product.name),
          el('p', {}, `€${product.price}, ships in 2 days.`),
          el('a', { href: searchHref(product.kind) }, `More ${product.kind}s`)
        )
      );
    },
  });

  startRouter(routes, {
    history,
    show: (view) => {
      address.textContent = addressOf(history.url());
      page.replaceChildren(view);
      return page;
    },
    fail: (error) => el('p', { className: css.failed }, error.message),
  });

  return app;
};
