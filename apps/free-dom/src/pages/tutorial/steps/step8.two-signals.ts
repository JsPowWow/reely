import { button, computed, div, output, p, signal } from '@reely/dommy';

import css from './counter.module.css';

// Two signals change on every press, so the summary that reads both is written twice.
export const Counter = (): HTMLElement => {
  const count = signal(0);
  const presses = signal(0);
  const parity = computed(() => (count.value % 2 === 0 ? 'even' : 'odd'));
  const summary = computed(() => `Presses: ${presses.value}, net: ${count.value}`);

  const press = (step: number): void => {
    count.value += step;
    presses.value += 1;
  };

  return div(
    { className: css.counter },
    output({ className: css.value, 'data-parity': parity }, count),
    button({ onClick: () => press(1) }, '+1'),
    button({ onClick: () => press(-1), disabled: () => count.value === 0 }, '−1'),
    p({ className: css.summary }, summary)
  );
};
