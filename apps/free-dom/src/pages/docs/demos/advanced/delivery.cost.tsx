import { signal } from '@reely/dommy';

import css from '../demos.module.css';

type Delivery = 'Courier' | 'Pickup';

const isDelivery = (value: string): value is Delivery =>
  value === 'Courier' || value === 'Pickup';

// The cost depends on what its last run read: the courier fees or the pickup fees, never all four.
export const DeliveryCost = (): Node => {
  const delivery = signal<Delivery>('Courier');
  const courier = signal(5);
  const evening = signal(2);
  const locker = signal(1);
  const storage = signal(3);
  const fees = [
    { label: 'Courier fee', fee: courier },
    { label: 'Evening slot', fee: evening },
    { label: 'Locker fee', fee: locker },
    { label: 'Storage fee', fee: storage },
  ];
  const runs = document.createTextNode('0');

  const cost = (): number => {
    runs.data = String(Number(runs.data) + 1);
    return delivery.value === 'Courier'
      ? courier.value + evening.value
      : locker.value + storage.value;
  };

  return (
    <div className={css.row}>
      <label className={css.field}>
        Delivery
        <select
          onInput={(event) => {
            const { value } = event.currentTarget;
            if (isDelivery(value)) {
              delivery.value = value;
            }
          }}
        >
          <option>Courier</option>
          <option>Pickup</option>
        </select>
      </label>
      {fees.map(({ label, fee }) => (
        <label className={css.field}>
          {label}
          <input
            type='number'
            min='0'
            max='9'
            value={() => String(fee.value)}
            onInput={(event) => (fee.value = Number(event.currentTarget.value))}
          />
        </label>
      ))}
      <output className={css.value}>€{cost}</output>
      <p className={css.status}>
        The cost ran <span data-runs>{runs}</span> time(s)
      </p>
    </div>
  );
};
