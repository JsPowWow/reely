import { signal } from '@reely/dommy';

import css from './demos.module.css';

// The signal is a child of <output>: dommy binds it to one text node and edits only that node.
export const LikeButton = (): Node => {
  const likes = signal(41);

  return (
    <div className={css.row}>
      <output className={css.value}>{likes}</output>
      <button onClick={() => (likes.value += 1)}>Like</button>
    </div>
  );
};
