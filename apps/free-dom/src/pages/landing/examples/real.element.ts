import { button } from '@reely/dommy';
import { media } from '@reely/dommy/kit';

import css from './examples.module.css';

const shakeFrames = [0, -10, 10, -6, 6, 0].map((x) => ({
  transform: `translateX(${x}px)`,
}));
const pulseFrames = [{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }];

// A tag factory returns the element itself, typed as one:
// `shake.animate()` needs no ref and no wrapper.
export const ShakeButton = (): HTMLButtonElement => {
  const calm = media('(prefers-reduced-motion: reduce)');
  const shake = button(
    {
      className: css.solid,
      onClick: () =>
        shake.animate(calm.value ? pulseFrames : shakeFrames, {
          duration: 400,
          easing: 'ease-out',
        }),
    },
    'Shake me'
  );
  return shake;
};
