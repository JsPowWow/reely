import { media, persisted } from '@reely/dommy-kit';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

const sizes = ['small', 'medium', 'large'] as const;
type Size = (typeof sizes)[number];

const labels: Record<Size, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

const isSize = (stored: unknown): stored is Size =>
  sizes.some((size) => size === stored);

// The size lives in localStorage: reload the page, or change
// it in a second tab, and this one follows. Both helpers
// stop with the render that made them.
export const ReaderSettings = (): Node => {
  const size = persisted<Size>('reader-size', 'medium', { is: isSize });
  const dark = media('(prefers-color-scheme: dark)');

  return (
    <div className={css.stack}>
      <div className={css.row} role='group' aria={{ ariaLabel: 'Text size' }}>
        {sizes.map((choice) => (
          <button
            type='button'
            aria={{ ariaPressed: () => String(size.value === choice) }}
            onClick={() => (size.value = choice)}
          >
            {labels[choice]}
          </button>
        ))}
      </div>
      <article className={own.article} data-size={size}>
        Three of us split the bill, and the waiter brought four forks.
      </article>
      <p className={css.note}>
        {() => `Your system asks for ${dark.value ? 'a dark' : 'a light'} page`}
      </p>
    </div>
  );
};
