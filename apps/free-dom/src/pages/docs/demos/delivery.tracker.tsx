import { Show, signal } from '@reely/dommy';

import css from './demos.module.css';

// `Show` swaps the branch only when the truthiness of `when` changes; laps update inside it.
export const RaceFinish = (): Node => {
  const lap = signal(1);
  const winner = signal<string | null>(null);

  return (
    <div className={css.row}>
      <Show when={winner} fallback={() => <p className={css.pending}>Racing, lap {lap}</p>}>
        {() => <p className={css.plate}>Winner: {winner}</p>}
      </Show>
      <button onClick={() => (lap.value += 1)} disabled={() => winner.value !== null}>
        Next lap
      </button>
      <button onClick={() => (winner.value = winner.value === null ? 'Car 3' : null)}>
        {() => (winner.value === null ? 'Finish' : 'Restart')}
      </button>
    </div>
  );
};
