import { noop } from '@reely/utils';

import { CheckoutLog } from './checkout.log';
import { clickButton, mounted, tick } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

describe('CheckoutLog (logger)', () => {
  let view: Mounted;
  let info: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    info = vi.spyOn(console, 'info').mockImplementation(noop);
    view = mounted(() => <CheckoutLog />);
  });

  afterEach(() => {
    view.dispose();
    vi.restoreAllMocks();
  });

  it('keeps the checkout scope silent until it is enabled', () => {
    clickButton(view.host, 'Restore the cart');
    const silent = info.mock.calls.length;
    tick(view.host);
    clickButton(view.host, 'Restore the cart');

    expect(silent).toBe(0);
    expect(info).toHaveBeenCalledWith('[[checkout]]\t', 'cart restored', { items: 2 });
  });

  it('logs the default scope always', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(noop);

    clickButton(view.host, 'Fail the payment');

    expect(error).toHaveBeenCalledWith('[[default]]\t', 'payment service is down');
  });

  it('logs the steps of a promise chain on their way through', async () => {
    tick(view.host);

    clickButton(view.host, 'Work out the total');
    await vi.waitFor(() => expect(view.text()).toContain('Total: 42.50'));

    expect(info).toHaveBeenCalledWith('[[checkout]]\t', 'prices', [12.5, 30]);
    expect(info).toHaveBeenCalledWith('[[checkout]]\t', 'total', 42.5);
  });
});
