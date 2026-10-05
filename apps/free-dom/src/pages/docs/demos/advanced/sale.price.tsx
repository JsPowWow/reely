import { Show, signal } from '@reely/dommy';

import css from '../demos.module.css';

// A signal of a node would put one node in two places. `Show` builds a node for each place.
export const SalePrice = (): Node => {
  const onSale = signal(false);
  const Price = (): Node => (
    <Show when={onSale} fallback={() => '€40'}>
      {() => <mark>€32</mark>}
    </Show>
  );

  return (
    <div className={css.row}>
      <button onClick={() => (onSale.value = !onSale.value)}>
        {() => (onSale.value ? 'End the sale' : 'Start the sale')}
      </button>
      <p className={css.status}>
        Rain jacket, <Price />. Pay <Price /> at checkout.
      </p>
    </div>
  );
};
