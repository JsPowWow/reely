import { onCleanup, signal } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

const checkout = scopedLogger('checkout');

const fetchPrices = (): Promise<number[]> => Promise.resolve([12.5, 30]);

// A named scope stays silent until it is enabled, so its
// calls can stay in the code; the default scope always logs.
// `logWith` logs a value between two steps and passes it on.
export const CheckoutLog = (): Node => {
  const total = signal('');
  onCleanup(() => checkout.setEnabled(false));

  const workOutTotal = (): Promise<void> =>
    fetchPrices()
      .then(checkout.logWith('info', 'prices'))
      .then((prices) => prices.reduce((sum, price) => sum + price, 0))
      .then(checkout.logWith('info', 'total'))
      .then((sum) => {
        total.value = `Total: ${sum.toFixed(2)}`;
      });

  return (
    <div className={css.stack}>
      <label className={own.check}>
        <input
          type='checkbox'
          onChange={(event) => checkout.setEnabled(event.currentTarget.checked)}
        />
        Log the checkout scope
      </label>
      <div className={css.row}>
        <button
          type='button'
          onClick={() => checkout.info('cart restored', { items: 2 })}
        >
          Restore the cart
        </button>
        <button type='button' onClick={() => void workOutTotal()}>
          Work out the total
        </button>
        <button
          type='button'
          onClick={() => scopedLogger().error('payment service is down')}
        >
          Fail the payment
        </button>
      </div>
      <p className={css.note}>{total}</p>
    </div>
  );
};
