import { batch, computed, effect, signal } from '@reely/signals';

import css from '../../../demo/examples.module.css';

const price = 12;

const euros = (amount: number): string => `€${amount.toFixed(2)}`;

// The total is computed from the quantity and the discount.
// The bulk button changes both inside one `batch`, so the
// effect that saves the draft runs once, not twice.
export const OrderTotal = (): Node => {
  const quantity = signal(1);
  const discount = signal(0);
  const total = computed(() => quantity.value * price * (1 - discount.value));
  const saved = signal('');
  let saves = 0;
  effect(() => {
    saves += 1;
    const off = discount.value > 0 ? `, ${discount.value * 100}% off` : '';
    const line = `${quantity.value} × ${euros(price)}${off}`;
    saved.value = `Draft saved ${saves} ${saves === 1 ? 'time' : 'times'}: ${line}`;
  });

  const orderForTeam = (): void =>
    batch(() => {
      quantity.value = 10;
      discount.value = 0.1;
    });

  return (
    <div className={css.stack}>
      <p className={css.badge}>
        <output>{() => euros(total.value)}</output>
      </p>
      <div className={css.row}>
        <button type='button' onClick={() => (quantity.value += 1)}>
          One more
        </button>
        <button type='button' onClick={orderForTeam}>
          Order 10 for the team
        </button>
      </div>
      <p className={css.note}>{saved}</p>
    </div>
  );
};
