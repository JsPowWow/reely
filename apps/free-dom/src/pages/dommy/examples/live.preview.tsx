import { signal } from '@reely/dommy';

import css from '../../../demo/examples.module.css';

const maxLength = 15;

// Each value in the markup is bound to the one text node
// that shows it: a keystroke edits those two, nothing else.
export const LivePreview = (): Node => {
  const username = signal('maria');
  const left = (): number => maxLength - username.value.length;

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Username
        <input
          value={username}
          maxLength={maxLength}
          onInput={(event) => (username.value = event.currentTarget.value)}
        />
      </label>
      <p className={css.badge}>example.com/@{() => username.value || 'you'}</p>
      <p className={css.note}>
        {() => `${left()} ${left() === 1 ? 'character' : 'characters'} left`}
      </p>
    </div>
  );
};
