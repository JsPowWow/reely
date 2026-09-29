import { Show, signal } from '@reely/dommy';

import css from '../demos.module.css';

// A signal of a node would put one node in two places. `Show` builds a node for each place.
export const TurnBold = (): Node => {
  const bold = signal(false);
  const Name = (): Node => (
    <Show when={bold} fallback={() => 'reely'}>
      {() => <b>reely</b>}
    </Show>
  );

  return (
    <div className={css.row}>
      <button onClick={() => (bold.value = !bold.value)}>{() => (bold.value ? 'Turn plain' : 'Turn bold')}</button>
      <p className={css.status}>
        Welcome to <Name />. <Name /> is awesome!
      </p>
    </div>
  );
};
