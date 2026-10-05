import { Await, signal } from '@reely/dommy';
import { defineRoutes } from '@reely/dommy/router';
import type { Page } from '@reely/dommy/router';

import css from './demos.module.css';

/** How long the cart's page takes to load, as a page behind `import()` would. */
export const cartDelay = 600;

const page =
  (text: string, className = css.plate): Page =>
  (): Node =>
    <p className={className}>{text}</p>;

// Each pattern names its params, typed: `id` is a string here, `topic` would not compile.
const shop = defineRoutes({
  '/': () => page('Shop: 24 products'),
  '/products/:id': ({ id }) => page(`Product #${id}`),
  '/cart': () =>
    new Promise<Page>((loaded) =>
      setTimeout(() => loaded(page('Cart: 2 items, €38.00')), cartDelay)
    ),
  '/*rest': ({ rest }) => page(`No page at /${rest}`, css.failed),
});

const addresses = ['/', '/products/42', '/cart', '/orders/7'];

// The routes answer an address with its page; here `Await` shows it, while on this site
// a `Router` does the same for the address bar, following every link.
export const ShopAddress = (): Node => {
  const address = signal('/products/42');

  return (
    <div className={css.row}>
      {addresses.map((each) => (
        <button type='button' onClick={() => (address.value = each)}>
          {each}
        </button>
      ))}
      <output className={css.status}>shop.example{address}</output>
      <div className={css.slot}>
        <Await
          promise={() => shop(address.value)}
          fallback={() => <p className={css.pending}>Loading the page…</p>}
          catch={(error) => <p className={css.failed}>{error.message}</p>}
        >
          {(shown) => shown?.()}
        </Await>
      </div>
    </div>
  );
};
