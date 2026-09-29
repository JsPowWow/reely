import { Show, signal } from '@reely/dommy';

import css from '../demos.module.css';

// `Show` swaps the paragraph only when the name turns empty or not; typing edits one text node.
export const Greeting = (): Node => {
  const name = signal('');

  return (
    <div className={css.row}>
      <label className={css.field}>
        Your name
        <input onInput={(event) => (name.value = event.currentTarget.value)} />
      </label>
      <Show
        when={() => name.value.trim() !== ''}
        fallback={() => <p className={css.pending}>Please enter your name</p>}
      >
        {() => (
          <p className={css.plate}>
            Hello, <b>{name}</b>
          </p>
        )}
      </Show>
    </div>
  );
};
