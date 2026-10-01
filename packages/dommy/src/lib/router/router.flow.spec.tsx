import { effect, onCleanup } from '@reely/signals';

import { currentPath } from './router.current';
import { Router } from './router.flow';
import { navigate } from './router.navigate';
import { defineRoutes } from './router.routes';
import { mount } from '../mount';

import type { Page, Routes } from './router.types';

const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 0));

/** A page with a heading, a place to link to, and links to the other pages. */
const pageNamed =
  (name: string): Page =>
  () =>
    (
      <main>
        <h1>{name}</h1>
        <a href='/cart'>Cart</a>
        <a href='/orders/7'>Order 7</a>
        <a href='/orders/7#delivery'>Delivery of order 7</a>
        <a href='#reviews'>Reviews</a>
        <p id='delivery'>Delivery</p>
      </main>
    );

const shop = defineRoutes({
  '/': () => pageNamed('Shop'),
  '/cart': () => pageNamed('Cart'),
  '/orders/:id': ({ id }) => pageNamed(`Order ${id}`),
});

const heading = (): string | null | undefined => document.querySelector('h1')?.textContent;

/** Clicks a link as a reader would; returns whether the router took the click over. */
const clickLink = (text: string, init: MouseEventInit = {}): boolean => {
  const link = Array.from(document.querySelectorAll('a')).find((each) => each.textContent === text);
  const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  let taken = false;
  // past the router, the click is stopped, since jsdom cannot load another document
  window.addEventListener(
    'click',
    (event) => {
      taken = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true }
  );
  link?.dispatchEvent(click);
  return taken;
};

describe('Router', () => {
  let dispose: VoidFunction;
  const scrollTo = vi.fn();

  const start = async (routes: Routes = shop, at = '/', state: unknown = null): Promise<void> => {
    history.replaceState(state, '', at);
    dispose = mount(document.body, () => (
      <Router routes={routes} catch={(error) => <p role='alert'>{error.message}</p>} />
    ));
    await settle();
  };

  beforeEach(() => {
    window.scrollTo = scrollTo;
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    dispose();
    scrollTo.mockReset();
    vi.restoreAllMocks();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('shows the page of the location it starts at', async () => {
    await start(shop, '/orders/42');

    expect(heading()).toBe('Order 42');
  });

  it('follows a link to its page without loading the document, and takes the last page down', async () => {
    const left = vi.fn();
    await start(
      defineRoutes({
        '/': () => () => {
          onCleanup(left);
          return pageNamed('Shop')();
        },
        '/cart': () => pageNamed('Cart'),
      })
    );

    const taken = clickLink('Cart');
    await settle();

    expect(taken).toBe(true);
    expect(location.pathname).toBe('/cart');
    expect(heading()).toBe('Cart');
    expect(document.querySelectorAll('main')).toHaveLength(1);
    expect(left).toHaveBeenCalledOnce();
  });

  it('leaves to the browser the clicks that open elsewhere, and a link to a place on the page', async () => {
    await start();
    const cart = document.querySelector('a[href="/cart"]');

    const withModifier = clickLink('Cart', { ctrlKey: true });
    const middleButton = clickLink('Cart', { button: 1 });
    cart?.setAttribute('target', '_blank');
    const inNewTab = clickLink('Cart');
    cart?.removeAttribute('target');
    cart?.setAttribute('download', '');
    const download = clickLink('Cart');
    cart?.removeAttribute('download');
    cart?.setAttribute('href', 'https://example.com/cart');
    const elsewhere = clickLink('Cart');
    const placeOnPage = clickLink('Reviews');

    expect([withModifier, middleButton, inNewTab, download, elsewhere, placeOnPage]).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(heading()).toBe('Shop');
  });

  it('starts a new page at the top, its heading focused for a screen reader', async () => {
    await start();

    clickLink('Cart');
    await settle();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(document.activeElement).toBe(document.querySelector('h1'));
  });

  it('opens a page at the place its link names', async () => {
    await start();

    clickLink('Delivery of order 7');
    await settle();
    const place = document.getElementById('delivery');

    expect(heading()).toBe('Order 7');
    expect(place?.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(place);
  });

  it('goes back to the last page where the reader had scrolled it', async () => {
    await start(shop, '/orders/7');
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(640);
    clickLink('Cart');
    await settle();
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);

    history.back();
    await vi.waitFor(() => expect(heading()).toBe('Order 7'));

    expect(scrollTo).toHaveBeenLastCalledWith(0, 640);
    vi.restoreAllMocks();
  });

  it('comes back to where the reader had scrolled a page they left by going back', async () => {
    await start(shop, '/orders/7');
    clickLink('Cart');
    await settle();
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(220);
    window.dispatchEvent(new Event('scroll'));
    await new Promise((done) => setTimeout(done, 150));

    history.back();
    await vi.waitFor(() => expect(heading()).toBe('Order 7'));
    history.forward();
    await vi.waitFor(() => expect(heading()).toBe('Cart'));

    expect(scrollTo).toHaveBeenLastCalledWith(0, 220);
  });

  it('keeps a scroll for a page only once that page was shown', async () => {
    let cartLoads = 0;
    const slowCart = Promise.withResolvers<Page>();
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => (cartLoads++ === 0 ? slowCart.promise : pageNamed('Cart')),
        '/orders/:id': ({ id }) => pageNamed(`Order ${id}`),
      })
    );
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);

    clickLink('Cart');
    navigate('/orders/7');
    await settle();
    history.back();
    await vi.waitFor(() => expect(heading()).toBe('Cart'));

    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it('opens a reloaded page where the reader had scrolled it', async () => {
    await start(shop, '/orders/7', { reelyScroll: 310 });

    expect(scrollTo).toHaveBeenCalledWith(0, 310);
  });

  it('shows the page again for a new query, and scrolls to a place on the page it is on', async () => {
    const queries: string[] = [];
    await start(
      defineRoutes({
        '/': () => () => {
          queries.push(location.search);
          return pageNamed('Shop')();
        },
      })
    );

    navigate('/?sort=price');
    await settle();
    navigate('/?sort=price#delivery');
    await settle();

    expect(queries).toEqual(['', '?sort=price']);
    expect(document.getElementById('delivery')?.scrollIntoView).toHaveBeenCalled();
  });

  it('opens a page whose place in the URL is not valid percent-encoding, at the top', async () => {
    await start();

    navigate('/cart#%E0%A4');
    await settle();

    expect(heading()).toBe('Cart');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the failure of a page that throws while it renders', async () => {
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => () => {
          throw new Error('The cart could not render');
        },
      })
    );

    navigate('/cart');
    await settle();

    expect(document.querySelector('[role="alert"]')?.textContent).toBe('The cart could not render');
  });

  it("focuses the new page's heading, not one the app shows around the router", async () => {
    history.replaceState(null, '', '/');
    dispose = mount(document.body, () => (
      <>
        <h1>Shop app</h1>
        <Router routes={shop} catch={(error) => <p role='alert'>{error.message}</p>} />
      </>
    ));
    await settle();

    navigate('/cart');
    await settle();

    expect(document.activeElement?.textContent).toBe('Cart');
  });

  it('adds no history entry for a move to the URL already shown', async () => {
    await start(shop, '/cart');
    const entries = history.length;

    navigate('/cart');
    await settle();

    expect(history.length).toBe(entries);
  });

  it('tells bindings the path of the page shown', async () => {
    await start();
    const seen: string[] = [];
    const stop = effect(() => void seen.push(currentPath()));

    navigate('/cart');
    await settle();
    stop();

    expect(seen).toEqual(['/', '/cart']);
  });

  it('keeps the page shown until the next one has loaded, and drops one a later click overtook', async () => {
    const slowCart = Promise.withResolvers<Page>();
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => slowCart.promise,
        '/orders/:id': ({ id }) => pageNamed(`Order ${id}`),
      })
    );

    clickLink('Cart');
    await settle();
    const whileLoading = heading();
    clickLink('Order 7');
    await settle();
    slowCart.resolve(pageNamed('Cart'));
    await settle();

    expect(whileLoading).toBe('Shop');
    expect(heading()).toBe('Order 7');
  });

  it('shows the failure of a page that does not load, and of a path no route answers', async () => {
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => Promise.reject(new Error('The cart did not load')),
      })
    );

    clickLink('Cart');
    await settle();
    const failed = document.querySelector('[role="alert"]')?.textContent;
    navigate('/orders/7');
    await settle();

    expect(failed).toBe('The cart did not load');
    expect(document.querySelector('[role="alert"]')?.textContent).toBe('No route answers /orders/7');
  });

  it('goes where code sends it with `navigate`', async () => {
    await start();

    navigate('/orders/9');
    await settle();

    expect(location.pathname).toBe('/orders/9');
    expect(heading()).toBe('Order 9');
  });

  it('stops taking links over, and gives scrolling back to the browser, once its render is disposed', async () => {
    const restoration = history.scrollRestoration;
    await start();
    const whileShown = history.scrollRestoration;

    dispose();
    const link = <a href='/cart'>Cart</a>;
    document.body.append(link);
    const taken = clickLink('Cart');
    document.body.removeChild(link);
    dispose = mount(document.body, () => null);

    expect(taken).toBe(false);
    expect(whileShown).toBe('manual');
    expect(history.scrollRestoration).toBe(restoration);
  });
});
