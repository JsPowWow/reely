import { button, div, effect, output, replaceChildrenOf, signal } from '@reely/dommy';

import css from './counter.module.css';

// A signal holds the state; a callback ref subscribes the output to it and redraws it on every change.
export const Counter = (): HTMLElement => {
  const count = signal(0);

  const redrawOnChange = (element: HTMLOutputElement | null): void => {
    if (element) {
      effect(() => {
        replaceChildrenOf(element)(count.value);
      });
    }
  };

  return div(
    { className: css.counter },
    output({ className: css.value, elementRef: redrawOnChange }),
    button({ onClick: () => (count.value += 1) }, '+1'),
    button({ onClick: () => (count.value -= 1) }, '−1')
  );
};
