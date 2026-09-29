import { effect, signal } from '@reely/dommy';

import css from '../demos.module.css';

// The effect reads and writes `timesChecked`; its own write, and the reset, do not run it again.
export const CheckboxCounter = (): Node => {
  const checked = signal(false);
  const timesChecked = signal(0);
  effect(() => {
    if (checked.value) {
      timesChecked.value += 1;
    }
  });

  return (
    <div className={css.row}>
      <label className={css.check}>
        <input type='checkbox' checked={checked} onChange={(event) => (checked.value = event.currentTarget.checked)} />
        Checked
      </label>
      <output className={css.value}>{timesChecked}</output>
      <span>time(s)</span>
      <button onClick={() => (timesChecked.value = 0)}>Reset</button>
    </div>
  );
};
