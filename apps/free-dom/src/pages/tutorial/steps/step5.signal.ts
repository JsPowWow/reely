import { button, div, effect, output, replaceChildrenOf, signal } from '@reely/dommy';

import css from './counter.module.css';

// A signal holds the state; an effect redraws the output every time the signal changes.
export const Counter = (): HTMLElement => {
  const count = signal(0);
  const value = output({ className: css.value });

  effect(() => {
    replaceChildrenOf(value)(count.value);
  });

  return div(
    { className: css.counter },
    value,
    button({ onClick: () => (count.value += 1) }, '+1'),
    button({ onClick: () => (count.value -= 1) }, '−1')
  );
};
