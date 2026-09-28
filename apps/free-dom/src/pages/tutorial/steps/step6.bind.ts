import { button, div, output, signal } from '@reely/dommy';

import css from './counter.module.css';

// Pass the signal itself: dommy binds it to one text node and updates only that node.
export const Counter = (): HTMLElement => {
  const count = signal(0);

  return div(
    { className: css.counter },
    output({ className: css.value }, count),
    button({ onClick: () => (count.value += 1) }, '+1'),
    button({ onClick: () => (count.value -= 1) }, '−1')
  );
};
