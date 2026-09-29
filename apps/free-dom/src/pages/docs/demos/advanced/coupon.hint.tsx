import { Show, signal } from '@reely/dommy';

import css from '../demos.module.css';

// `Show` swaps the paragraph only when the code turns empty or not; typing edits one text node.
export const CouponHint = (): Node => {
  const coupon = signal('');

  return (
    <div className={css.row}>
      <label className={css.field}>
        Coupon
        <input onInput={(event) => (coupon.value = event.currentTarget.value)} />
      </label>
      <Show
        when={() => coupon.value.trim() !== ''}
        fallback={() => <p className={css.pending}>Have a coupon? Enter it here.</p>}
      >
        {() => (
          <p className={css.plate}>
            <b>{coupon}</b> will be applied at checkout
          </p>
        )}
      </Show>
    </div>
  );
};
