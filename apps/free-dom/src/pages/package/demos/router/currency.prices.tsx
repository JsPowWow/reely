import { computed, signal } from '@reely/dommy';
import {
  defineRoutes,
  followLinks,
  href,
  memoryHistory,
  Router,
} from '@reely/dommy/router';

import css from './router.module.css';

const paths = { shop: '/', product: '/products/:slug' } as const;

const products = [
  { slug: 'oak-desk-lamp', name: 'Oak desk lamp', euros: 59 },
  { slug: 'beech-chair', name: 'Beech chair', euros: 89 },
];

const rates = { eur: 1, usd: 1.08 } as const;
const currencies = ['eur', 'usd'] as const;
type Currency = (typeof currencies)[number];

export const CurrencyPrices = (): Node => {
  // the currency is a setting of the shop, not a page: it rides in the address
  const shop = memoryHistory('/?currency=eur');
  const currency = signal<Currency>('eur');

  const price = (euros: number): string =>
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency(),
    }).format(euros * rates[currency()]);

  const pay = (next: Currency): void => {
    const address = shop.url();
    address.searchParams.set('currency', next);
    // a setting alone changed: no new page, so what the reader typed stays
    shop.navigate(address, { replace: true });
    currency.set(next);
  };

  const routes = defineRoutes({
    [paths.shop]: () => (): Node =>
      (
        <ul className={css.rows}>
          {products.map(({ slug, name, euros }) => (
            <li>
              <a href={href(paths.product, { slug })}>
                {name}
                <small>{() => price(euros)}</small>
              </a>
            </li>
          ))}
        </ul>
      ),
    [paths.product]: ({ slug }) => {
      const product = products.find((each) => each.slug === slug);
      return (
        product &&
        ((): Node => {
          const count = signal('1');
          return (
            <div>
              <h2>{product.name}</h2>
              <label>
                How many{' '}
                <input
                  type='number'
                  min='1'
                  value={count}
                  onInput={(event) => count.set(event.currentTarget.value)}
                />
              </label>
              <p>
                {() =>
                  `Total: ${price(product.euros * (Number(count()) || 0))}`
                }
              </p>
              <a href={href(paths.shop)}>Back to the shop</a>
            </div>
          );
        })
      );
    },
  });

  // the address as the frame prints it, after every move and every switch
  const address = computed(() => {
    shop.path();
    void currency();
    const { pathname, search } = shop.url();
    return `${pathname}${search}`;
  });

  const app = (
    <div className={css.app}>
      <p className={css.address}>{address}</p>
      <div className={css.body}>
        <nav className={css.menu}>
          {currencies.map((each) => (
            <button
              type='button'
              aria={{ ariaPressed: () => String(currency() === each) }}
              onClick={() => pay(each)}
            >
              {each.toUpperCase()}
            </button>
          ))}
        </nav>
        <section className={css.page}>
          <Router
            routes={routes}
            history={shop}
            keep={['currency']}
            catch={(error) => <p className={css.failed}>{error.message}</p>}
          />
        </section>
      </div>
    </div>
  );
  followLinks(app, shop.navigate);
  return app;
};
