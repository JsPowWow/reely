import { button, computed, div, output, signal } from '@reely/dommy';

import css from './counter.module.css';

// Any function in a prop is bound like a signal: `disabled` follows the count, no computed needed.
export const Counter = (): HTMLElement => {
  const count = signal(0);
  const parity = computed(() => (count.value % 2 === 0 ? 'even' : 'odd'));

  return div(
    { className: css.counter },
    output({ className: css.value, 'data-parity': parity }, count),
    button({ onClick: () => (count.value += 1) }, '+1'),
    button({ onClick: () => (count.value -= 1), disabled: () => count.value === 0 }, '−1')
  );
};
