import { Show, signal } from '@reely/dommy';

import css from './demos.module.css';

// `Show` swaps the branch only when the truthiness of `when` changes; the stops update inside it.
export const DeliveryTracker = (): Node => {
  const stopsAway = signal(5);
  const deliveredAt = signal<string | null>(null);

  return (
    <div className={css.row}>
      <Show
        when={deliveredAt}
        fallback={() => <p className={css.pending}>Out for delivery, {stopsAway} stops away</p>}
      >
        {() => <p className={css.plate}>Delivered at {deliveredAt}</p>}
      </Show>
      <button
        onClick={() => (stopsAway.value -= 1)}
        disabled={() => deliveredAt.value !== null || stopsAway.value === 2}
      >
        Next stop
      </button>
      <button
        onClick={() => {
          if (deliveredAt.value === null) {
            deliveredAt.value = '14:32';
          } else {
            // the next parcel starts five stops away; the hidden fallback takes the new count on its return
            stopsAway.value = 5;
            deliveredAt.value = null;
          }
        }}
      >
        {() => (deliveredAt.value === null ? 'Deliver' : 'Send another')}
      </button>
    </div>
  );
};
