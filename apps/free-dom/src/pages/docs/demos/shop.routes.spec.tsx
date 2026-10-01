import { cartDelay, ShopAddress } from './shop.routes';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('ShopAddress (router)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('answers each address with its page, the params read from the path', async () => {
    const view = mounted(() => <ShopAddress />);
    await vi.advanceTimersByTimeAsync(0);
    const product = view.text();

    clickButton(view.host, '/orders/7');
    await vi.advanceTimersByTimeAsync(0);

    expect(product).toContain('Product #42');
    expect(view.text()).toContain('No page at /orders/7');
    view.dispose();
  });

  it('shows the cart once its page has loaded', async () => {
    const view = mounted(() => <ShopAddress />);

    clickButton(view.host, '/cart');
    await vi.advanceTimersByTimeAsync(0);
    const loading = view.text();
    await vi.advanceTimersByTimeAsync(cartDelay);

    expect(loading).toContain('Loading the page…');
    expect(view.text()).toContain('Cart: 2 items, €38.00');
    view.dispose();
  });
});
