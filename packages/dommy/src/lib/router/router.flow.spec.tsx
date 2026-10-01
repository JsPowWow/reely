import { defineRoutes, followLinks, memoryHistory, navigate, pageLoading } from '@reely/router';
import { onCleanup } from '@reely/signals';

import { Router } from './router.flow';
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

  it('shows the pages of a history of its own, for a widget with pages', async () => {
    history.replaceState(null, '', '/site');
    const help = memoryHistory('/orders/3');
    dispose = mount(document.body, () => {
      const widget = (
        <aside>
          <a href='/cart'>Cart</a>
          <p>{() => `At ${help.path()}`}</p>
          <Router routes={shop} history={help} catch={(error) => <p role='alert'>{error.message}</p>} />
        </aside>
      );
      followLinks(widget, help.navigate);
      return widget;
    });
    await settle();
    const first = heading();

    clickLink('Cart');
    await settle();

    expect(first).toBe('Order 3');
    expect(heading()).toBe('Cart');
    expect(document.querySelector('aside > p')?.textContent).toBe('At /cart');
    expect(location.pathname).toBe('/site');
  });

  it('lets a bar anywhere in the app say that the next page is loading', async () => {
    const slowCart = Promise.withResolvers<Page>();
    history.replaceState(null, '', '/');
    dispose = mount(document.body, () => (
      <>
        <progress hidden={() => !pageLoading()} />
        <Router
          routes={defineRoutes({ '/': () => pageNamed('Shop'), '/cart': () => slowCart.promise })}
          catch={(error) => <p role='alert'>{error.message}</p>}
        />
      </>
    ));
    await settle();
    const bar = document.querySelector('progress');

    navigate('/cart');
    const whileLoading = bar?.hidden;
    slowCart.resolve(pageNamed('Cart'));
    await settle();

    expect(whileLoading).toBe(false);
    expect(bar?.hidden).toBe(true);
    expect(heading()).toBe('Cart');
  });
});
