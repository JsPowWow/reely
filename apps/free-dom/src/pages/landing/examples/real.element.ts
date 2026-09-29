import { button } from '@reely/dommy';
import { media } from '@reely/dommy/kit';

import css from './examples.module.css';

const popFrames = [1, 1.12, 0.96, 1].map((scale) => ({
  transform: `scale(${scale})`,
}));
const pulseFrames = [{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }];

// A tag factory returns the element itself, typed as one:
// `addButton.animate()` needs no ref and no wrapper.
export const AddToCart = (): HTMLButtonElement => {
  const calm = media('(prefers-reduced-motion: reduce)');
  const addButton = button(
    {
      className: css.solid,
      onClick: () =>
        addButton.animate(calm.value ? pulseFrames : popFrames, {
          duration: 300,
          easing: 'ease-out',
        }),
    },
    'Add to cart'
  );
  return addButton;
};
