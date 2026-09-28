import { batch, button, computed, div, output, p, signal } from '@reely/dommy';

import css from './counter.module.css';

// `batch` applies both writes first, then runs each binding once: the summary is written once.
export const Counter = (): HTMLElement => {
  const count = signal(0);
  const presses = signal(0);
  const parity = computed(() => (count.value % 2 === 0 ? 'even' : 'odd'));
  const summary = computed(() => `Presses: ${presses.value}, net: ${count.value}`);

  const press = (step: number): void => {
    batch(() => {
      count.value += step;
      presses.value += 1;
    });
  };

  return div(
    { className: css.counter },
    output({ className: css.value, 'data-parity': parity }, count),
    button({ onClick: () => press(1) }, '+1'),
    button({ onClick: () => press(-1), disabled: () => count.value === 0 }, '−1'),
    p({ className: css.summary }, summary)
  );
};
