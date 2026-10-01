import { onCleanup } from '@reely/dommy';
import { ObjectStore } from '@reely/simple-store';

import css from '../../../demo/examples.module.css';

const heard = (who: string, count: number): string =>
  `${who} heard ${count} ${count === 1 ? 'change' : 'changes'}`;

// No signals here: each view subscribes by hand. The coupon
// banner follows a `select` of the coupon, so adding an item
// never reaches it, and the same coupon twice is no change.
export const CartStore = (): Node => {
  const cart = new ObjectStore({ items: 0, coupon: '' });
  const coupon = cart.select(({ coupon: code }) => code);
  const badge = document.createTextNode('0 items');
  const banner = document.createTextNode('No coupon');
  const badgeLog = document.createTextNode(heard('The badge', 0));
  const bannerLog = document.createTextNode(heard('The coupon banner', 0));
  let badgeHeard = 0;
  let bannerHeard = 0;

  onCleanup(
    cart.on('changed', ({ items }) => {
      badge.data = `${items} ${items === 1 ? 'item' : 'items'}`;
      badgeLog.data = heard('The badge', ++badgeHeard);
    })
  );
  onCleanup(
    coupon.on('changed', (code) => {
      banner.data = code === '' ? 'No coupon' : `${code}: 10% off`;
      bannerLog.data = heard('The coupon banner', ++bannerHeard);
    })
  );

  return (
    <div className={css.stack}>
      <p className={css.badge}>
        {badge}, {banner}
      </p>
      <div className={css.row}>
        <button
          type='button'
          onClick={() => cart.set(({ items }) => ({ items: items + 1 }))}
        >
          Add an item
        </button>
        <button type='button' onClick={() => cart.set({ coupon: 'SPRING10' })}>
          Apply SPRING10
        </button>
        <button type='button' onClick={() => cart.set({ coupon: '' })}>
          Remove the coupon
        </button>
      </div>
      <p className={css.note}>{badgeLog}</p>
      <p className={css.note}>{bannerLog}</p>
    </div>
  );
};
