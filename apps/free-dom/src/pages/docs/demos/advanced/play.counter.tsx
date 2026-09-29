import { effect, signal } from '@reely/dommy';

import css from '../demos.module.css';

// The effect reads and writes `plays`; its own write, and the reset, do not run it again.
export const PlayCounter = (): Node => {
  const playing = signal(false);
  const plays = signal(0);
  effect(() => {
    if (playing.value) {
      plays.value += 1;
    }
  });

  return (
    <div className={css.row}>
      <label className={css.check}>
        <input type='checkbox' checked={playing} onChange={(event) => (playing.value = event.currentTarget.checked)} />
        Playing
      </label>
      <output className={css.value}>{plays}</output>
      <span>play(s)</span>
      <button onClick={() => (plays.value = 0)}>Reset</button>
    </div>
  );
};
