import { button, div, effect, output, signal } from '@reely/dommy';

import css from './counter.module.css';

// A function ref gets the output once it exists; subscribing it to the signal is a binding by hand.
export const Counter = (): HTMLElement => {
  const count = signal(0);

  const showCount = (element: HTMLOutputElement): void => {
    effect(() => {
      element.textContent = String(count.value);
    });
  };

  return div(
    { className: css.counter },
    output({ className: css.value, elementRef: showCount }),
    button({ onClick: () => (count.value += 1) }, '+1'),
    button({ onClick: () => (count.value -= 1) }, '−1')
  );
};
