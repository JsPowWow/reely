import { signal } from '@reely/dommy';

import css from './demos.module.css';

// The signal is a child of <output>: dommy binds it to one text node and edits only that node.
export const Counter = (): Node => {
  const count = signal(0);

  return (
    <div className={css.row}>
      <output className={css.value}>{count}</output>
      <button onClick={() => (count.value += 1)}>+1</button>
    </div>
  );
};
