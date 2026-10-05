import { effect, signal } from '@reely/dommy';

import css from '../demos.module.css';

// `update` reads `plays` untracked, so the reset does not run the effect again.
export const PlayCounter = (): Node => {
  const playing = signal(false);
  const plays = signal(0);
  effect(() => {
    if (playing.value) {
      plays.update((count) => count + 1);
    }
  });

  return (
    <div className={css.row}>
      <label className={css.check}>
        <input
          type='checkbox'
          checked={playing}
          onChange={(event) => (playing.value = event.currentTarget.checked)}
        />
        Playing
      </label>
      <output className={css.value}>{plays}</output>
      <span>play(s)</span>
      <button onClick={() => (plays.value = 0)}>Reset</button>
    </div>
  );
};
