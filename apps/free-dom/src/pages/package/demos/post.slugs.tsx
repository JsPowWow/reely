import { signal } from '@reely/dommy';
import { capitalize, slugify } from '@reely/strings';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

// A blog post's title, typed in any script: every word gets
// its capital, and the address keeps letters, digits and
// hyphens only; a Latin letter loses its accent on the way.
export const PostSlugs = (): Node => {
  const title = signal('10 tips for remote work in 2026!');

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Post title
        <input
          value={title}
          onInput={(event) => (title.value = event.currentTarget.value)}
        />
      </label>
      <h3 className={own.post}>{() => capitalize(title.value)}</h3>
      <p className={css.note}>
        <code>{() => `/blog/${slugify(title.value)}`}</code>
      </p>
    </div>
  );
};
