import { computed, signal } from '@reely/dommy';

import css from './sectors.module.css';

// A signal in the markup is bound to the one text node that shows it.
export const Laps = (): Node => {
  const laps = signal(0);
  const toGo = computed(() => Math.max(0, 5 - laps.value));

  return (
    <div className={css.counter}>
      <output className={css.value}>{laps}</output>
      <button onClick={() => (laps.value += 1)} disabled={() => toGo.value === 0}>
        Complete a lap
      </button>
      <p className={css.note}>{() => (toGo.value === 0 ? 'Chequered flag' : `${toGo.value} laps to go`)}</p>
    </div>
  );
};
