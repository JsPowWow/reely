import { OrderTotal } from './order.total';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('OrderTotal (signals)', () => {
  it('saves the draft once for a change of two signals inside a batch', () => {
    const view = mounted(() => <OrderTotal />);

    clickButton(view.host, 'Order 10 for the team');

    expect(view.host.querySelector('output')?.textContent).toBe('€108.00');
    expect(view.text()).toContain('Draft saved 2 times: 10 × €12.00, 10% off');
    view.dispose();
  });

  it('adds one more at the price, and saves the draft again', () => {
    const view = mounted(() => <OrderTotal />);

    clickButton(view.host, 'One more');

    expect(view.host.querySelector('output')?.textContent).toBe('€24.00');
    expect(view.text()).toContain('Draft saved 2 times: 2 × €12.00');
    view.dispose();
  });
});
