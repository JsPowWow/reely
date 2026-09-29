import { button, div, p } from '@reely/dommy';
import { isSomeFunction } from '@reely/utils';

import css from './examples.module.css';

const reducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A tag factory returns the element itself, typed as `HTMLButtonElement`: no ref, no wrapper.
export const ShakeButton = (): Node => {
  const shake = button(
    {
      className: css.solid,
      onClick: () =>
        shake.animate(
          reducedMotion()
            ? [{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }]
            : [0, -10, 10, -6, 6, 0].map((x) => ({ transform: `translateX(${x}px)` })),
          { duration: 400, easing: 'ease-out' }
        ),
    },
    'Shake me'
  );

  return div(
    { className: css.row },
    shake,
    p({ className: css.note }, `shake instanceof HTMLButtonElement: ${String(shake instanceof HTMLButtonElement)}`)
  );
};
