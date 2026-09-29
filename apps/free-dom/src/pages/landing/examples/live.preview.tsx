import { signal } from '@reely/dommy';

import css from './examples.module.css';

// Each value in the markup is bound to the one text node
// that shows it: a keystroke edits those two, nothing else.
export const LivePreview = (): Node => {
  const name = signal('Ada');
  const length = (): number => name.value.length;

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Your name
        <input
          value={name}
          onInput={(event) => (name.value = event.currentTarget.value)}
        />
      </label>
      <p className={css.badge}>Hello, {() => name.value || 'stranger'}!</p>
      <p className={css.note}>
        {() => `${length()} ${length() === 1 ? 'letter' : 'letters'}`}
      </p>
    </div>
  );
};
