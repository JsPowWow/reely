import { signal } from '@reely/dommy';

import css from './examples.module.css';

// Each signal in the markup is bound to the one text node that shows it.
export const LivePreview = (): Node => {
  const name = signal('Ada');

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Your name
        <input value={name} onInput={(event) => (name.value = event.currentTarget.value)} />
      </label>
      <p className={css.badge}>Hello, {name}!</p>
      <p className={css.note}>{() => `${name.value.length} characters`}</p>
    </div>
  );
};
