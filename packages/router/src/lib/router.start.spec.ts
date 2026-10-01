import { effect, onCleanup, withOwner } from '@reely/signals';

import { currentPath, pageLoading } from './router.current';
import { followLinks } from './router.links';
import { memoryHistory } from './router.memory';
import { navigate } from './router.navigate';
import { defineRoutes } from './router.routes';
import { startRouter } from './router.start';

import type { RouterHistory } from './router.history';
import type { Router } from './router.start';
import type { Routes } from './router.types';

type Page = () => Node;

const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 0));

const element = (tag: string, attributes: Record<string, string>, ...children: (Node | string)[]): HTMLElement => {
  const created = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    created.setAttribute(name, value);
  }
  created.append(...children);
  return created;
};

/** A page with a heading, a place to link to, and links to the other pages. */
const pageNamed =
  (name: string): Page =>
  () =>
    element(
      'section',
      {},
      element('h1', {}, name),
      element('a', { href: '/cart' }, 'Cart'),
      element('a', { href: '/orders/7' }, 'Order 7'),
      element('a', { href: '/orders/7#delivery' }, 'Delivery of order 7'),
      element('a', { href: '#reviews' }, 'Reviews'),
      element('p', { id: 'delivery' }, 'Delivery')
    );

const shop = defineRoutes({
  '/': () => pageNamed('Shop'),
  '/cart': () => pageNamed('Cart'),
  '/orders/:id': ({ id }) => pageNamed(`Order ${id}`),
});

const heading = (): string | null | undefined => document.querySelector('h1')?.textContent;

const alert = (): string | null | undefined => document.querySelector('[role="alert"]')?.textContent;

/** Clicks a link as a reader would; returns whether a router took the click over. */
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

describe('startRouter', () => {
  let router: Router | undefined;
  const outlet = document.createElement('main');
  const scrollTo = vi.fn();

  const start = async (routes: Routes<Page> = shop, at = '/', state: unknown = null): Promise<Router> => {
    history.replaceState(state, '', at);
    document.body.replaceChildren(outlet);
    router = startRouter(routes, {
      show: (page) => {
        outlet.replaceChildren(page());
        return outlet;
      },
      fail: (error) => () => element('p', { role: 'alert' }, error.message),
    });
    await settle();
    return router;
  };

  beforeEach(() => {
    window.scrollTo = scrollTo;
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    router?.stop();
    router = undefined;
    scrollTo.mockReset();
    vi.restoreAllMocks();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('shows the page of the location it starts at', async () => {
    await start(shop, '/orders/42');

    expect(heading()).toBe('Order 42');
  });

  it('follows a link to its page without loading the document', async () => {
    await start();

    const taken = clickLink('Cart');
    await settle();

    expect(taken).toBe(true);
    expect(location.pathname).toBe('/cart');
    expect(heading()).toBe('Cart');
    expect(document.querySelectorAll('section')).toHaveLength(1);
  });

  it('leaves to the browser the clicks that open elsewhere, a link marked `rel="external"`, and a link to a place on the page', async () => {
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
    cart?.setAttribute('rel', 'external noopener');
    const external = clickLink('Cart');
    cart?.removeAttribute('rel');
    cart?.setAttribute('href', 'https://example.com/cart');
    const elsewhere = clickLink('Cart');
    const placeOnPage = clickLink('Reviews');

    expect([withModifier, middleButton, inNewTab, download, external, elsewhere, placeOnPage]).toEqual([
      false,
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

  it('shows the page again for a new query, handing it the query, and scrolls to a place on the page it is on', async () => {
    const sorts: string[] = [];
    await start(
      defineRoutes({
        '/': (_params, query) => {
          sorts.push(query.get('sort') ?? 'none');
          return pageNamed('Shop');
        },
      })
    );

    navigate('/?sort=price');
    await settle();
    navigate('/?sort=price#delivery');
    await settle();

    expect(sorts).toEqual(['none', 'price']);
    expect(document.getElementById('delivery')?.scrollIntoView).toHaveBeenCalled();
  });

  it('opens a page whose place in the URL is not valid percent-encoding, at the top', async () => {
    await start();

    navigate('/cart#%E0%A4');
    await settle();

    expect(heading()).toBe('Cart');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the failure of a page that throws while it is shown', async () => {
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

    expect(alert()).toBe('The cart could not render');
  });

  it("focuses the new page's heading, not one the app shows around the pages", async () => {
    await start();
    document.body.prepend(element('h1', {}, 'Shop app'));

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

  it('replaces the history entry for a redirect', async () => {
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/account': () => {
          navigate('/cart', { replace: true });
          return undefined;
        },
        '/cart': () => pageNamed('Cart'),
      })
    );
    const entries = history.length;

    navigate('/account');
    await settle();
    await settle();

    expect(heading()).toBe('Cart');
    expect(history.length).toBe(entries + 1);
    expect(alert()).toBeUndefined();
  });

  it('tells a page the path it is shown at while it renders', async () => {
    const seen: string[] = [];
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => () => {
          seen.push(currentPath());
          return pageNamed('Cart')();
        },
      })
    );

    navigate('/cart');
    await settle();

    expect(seen).toEqual(['/cart']);
  });

  it("focuses the page's h1 over a heading before it, and its first heading when it has no h1", async () => {
    await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => () => element('div', {}, element('h2', {}, 'Your basket'), element('h1', {}, 'Cart')),
        '/help': () => () => element('div', {}, element('h3', {}, 'Help')),
      })
    );

    navigate('/cart');
    await settle();
    const withH1 = document.activeElement?.textContent;
    navigate('/help');
    await settle();

    expect([withH1, document.activeElement?.textContent]).toEqual(['Cart', 'Help']);
  });

  it('tells bindings the path of the page shown', async () => {
    const { path } = await start();
    const seen: string[] = [];
    const stop = effect(() => void seen.push(`${path()} ${currentPath()}`));

    navigate('/cart');
    await settle();
    stop();

    expect(seen).toEqual(['/ /', '/cart /cart']);
  });

  it('keeps the page shown until the next one has loaded, says it is loading, and drops one a later click overtook', async () => {
    const slowCart = Promise.withResolvers<Page>();
    const slowOrder = Promise.withResolvers<Page>();
    const { loading } = await start(
      defineRoutes({
        '/': () => pageNamed('Shop'),
        '/cart': () => slowCart.promise,
        '/orders/:id': () => slowOrder.promise,
      })
    );
    const seen: boolean[] = [];
    const stop = effect(() => void seen.push(loading()));

    clickLink('Cart');
    await settle();
    const whileLoading = heading();
    clickLink('Order 7');
    slowCart.resolve(pageNamed('Cart'));
    await settle();
    const overtaken = heading();
    slowOrder.resolve(pageNamed('Order 7'));
    await settle();
    stop();

    expect([whileLoading, overtaken, heading()]).toEqual(['Shop', 'Shop', 'Order 7']);
    expect(seen).toEqual([false, true, false]);
  });

  it('tells the whole app that a page is loading, with `pageLoading`', async () => {
    const slowCart = Promise.withResolvers<Page>();
    await start(defineRoutes({ '/': () => pageNamed('Shop'), '/cart': () => slowCart.promise }));
    const seen: boolean[] = [];
    const stop = effect(() => void seen.push(pageLoading()));

    navigate('/cart');
    slowCart.resolve(pageNamed('Cart'));
    await settle();
    stop();

    expect(seen).toEqual([false, true, false]);
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
    const failed = alert();
    navigate('/orders/7');
    await settle();

    expect(failed).toBe('The cart did not load');
    expect(alert()).toBe('No route answers /orders/7');
  });

  it('goes where code sends it, with `navigate` or the router', async () => {
    const shown = await start();

    navigate('/orders/9');
    await settle();
    const sent = heading();
    shown.navigate('/cart');
    await settle();

    expect(sent).toBe('Order 9');
    expect(location.pathname).toBe('/cart');
    expect(heading()).toBe('Cart');
  });

  it('stops taking links over, and gives scrolling back to the browser, once stopped', async () => {
    const restoration = history.scrollRestoration;
    const { stop } = await start();
    const whileShown = history.scrollRestoration;

    stop();
    const taken = clickLink('Cart');

    expect(taken).toBe(false);
    expect(whileShown).toBe('manual');
    expect(history.scrollRestoration).toBe(restoration);
  });

  it('stops loading when even the failure page fails, and when it is stopped mid-load', async () => {
    const report = vi.fn();
    vi.stubGlobal('reportError', report);
    history.replaceState(null, '', '/');
    document.body.replaceChildren(outlet);
    const slowCart = Promise.withResolvers<Page>();
    const broken = startRouter(
      defineRoutes({ '/': () => Promise.reject(new Error('No shop')), '/cart': () => slowCart.promise }),
      {
        show: (page) => {
          outlet.replaceChildren(page());
          return outlet;
        },
        fail: () => {
          throw new Error('No failure page either');
        },
      }
    );
    await settle();
    const afterFailure = broken.loading();
    navigate('/cart');
    const whileLoading = broken.loading();
    broken.stop();

    expect([afterFailure, whileLoading, broken.loading()]).toEqual([false, true, false]);
    expect(report).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('gives scrolling back once, however many times it is stopped', async () => {
    const restoration = history.scrollRestoration;
    const first = await start();
    first.stop();
    const second = await start();

    first.stop();

    expect(history.scrollRestoration).toBe('manual');
    second.stop();
    expect(history.scrollRestoration).toBe(restoration);
  });

  it('stops with the owner it was started under', async () => {
    history.replaceState(null, '', '/');
    document.body.replaceChildren(outlet);
    const left = vi.fn();
    withOwner((dispose) => {
      startRouter(shop, {
        show: (page) => {
          outlet.replaceChildren(page());
          return outlet;
        },
        fail: () => pageNamed('Failed'),
      });
      onCleanup(left);
      setTimeout(dispose, 0);
    });
    await settle();
    await settle();

    expect(left).toHaveBeenCalledOnce();
    expect(clickLink('Cart')).toBe(false);
  });
});

describe('memoryHistory', () => {
  const panel = document.createElement('div');
  let router: Router | undefined;
  let unfollow: () => void = () => undefined;

  const mail = defineRoutes({
    '/': () => ({ title: 'Inbox', view: pageNamed('Inbox') }),
    '/cart': () => ({ title: 'Cart', view: pageNamed('Cart') }),
    '/orders/:id': ({ id }) => ({ title: `Order ${id}`, view: pageNamed(`Order ${id}`) }),
  });

  const start = async (at?: string): Promise<RouterHistory> => {
    history.replaceState(null, '', '/site/page');
    document.body.replaceChildren(element('a', { href: '/cart' }, 'Site cart'), panel);
    const inPanel = memoryHistory(at);
    router = startRouter(mail, {
      history: inPanel,
      show: ({ title, view }) => {
        panel.replaceChildren(element('h2', {}, title), view());
        return panel;
      },
      fail: (error) => ({ title: 'Failed', view: () => element('p', { role: 'alert' }, error.message) }),
    });
    unfollow = followLinks(panel, inPanel.navigate);
    await settle();
    return inPanel;
  };

  afterEach(() => {
    unfollow();
    router?.stop();
    router = undefined;
  });

  it('shows the pages of its own address, and leaves the location of the document alone', async () => {
    const { path } = await start('/orders/3');
    const seen: string[] = [];
    const stop = effect(() => void seen.push(path()));

    clickLink('Cart');
    await settle();
    stop();

    expect(heading()).toBe('Cart');
    expect(seen).toEqual(['/orders/3', '/cart']);
    expect(location.pathname).toBe('/site/page');
    expect(document.activeElement).toBe(panel.querySelector('h1'));
  });

  it('starts at the root, follows only the links `followLinks` gives it, and goes where it is sent, `replace` or not', async () => {
    const inPanel = await start();
    const first = heading();

    const outside = clickLink('Site cart');
    inPanel.navigate('/orders/5');
    await settle();
    const sent = heading();
    inPanel.navigate('/orders/6', { replace: true });
    await settle();

    expect(first).toBe('Inbox');
    expect(outside).toBe(false);
    expect([sent, heading()]).toEqual(['Order 5', 'Order 6']);
  });

  it('says when a page of its own is loading, and leaves `pageLoading` alone', async () => {
    const inPanel = await start('/');

    inPanel.navigate('/orders/1');
    const whileMoving = [inPanel.loading(), pageLoading()];
    await settle();

    expect(whileMoving).toEqual([true, false]);
    expect(inPanel.loading()).toBe(false);
  });

  it('reads a link against its own address', async () => {
    await start('/orders/3');
    panel.append(element('a', { href: '7' }, 'Next order'));

    clickLink('Next order');
    await settle();

    expect(heading()).toBe('Order 7');
  });
});

describe('followLinks', () => {
  it('stops following links once stopped, or with the owner it was called under', () => {
    const area = element('div', {}, element('a', { href: '/cart' }, 'Cart'));
    document.body.replaceChildren(area);
    const followed: string[] = [];

    const stop = followLinks(area, (to) => followed.push(to));
    clickLink('Cart');
    stop();
    clickLink('Cart');
    withOwner((dispose) => {
      followLinks(area, (to) => followed.push(`owned ${to}`));
      clickLink('Cart');
      dispose();
    });
    const afterDispose = clickLink('Cart');

    expect(followed).toEqual(['/cart', 'owned /cart']);
    expect(afterDispose).toBe(false);
  });
});
