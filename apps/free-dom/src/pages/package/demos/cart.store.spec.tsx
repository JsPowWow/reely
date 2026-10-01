import { CartStore } from './cart.store';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('CartStore (simple-store)', () => {
  it('tells the coupon banner only of coupon changes', () => {
    const view = mounted(() => <CartStore />);

    clickButton(view.host, 'Add an item');
    clickButton(view.host, 'Add an item');
    clickButton(view.host, 'Apply SPRING10');
    clickButton(view.host, 'Apply SPRING10');

    expect(view.text()).toContain('The badge heard 3 changes');
    expect(view.text()).toContain('The coupon banner heard 1 change');
    view.dispose();
  });
});
