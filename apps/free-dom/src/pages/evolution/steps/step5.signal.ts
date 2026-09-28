import { button, createObjectReference, div, effect, output, signal } from '@reely/dommy';

import css from './counter.module.css';

// A signal holds the state; an effect reads it, so it redraws the output after every change.
export const Counter = (): HTMLElement => {
  const result = createObjectReference<HTMLOutputElement>();
  const count = signal(0);

  const view = div(
    { className: css.counter },
    output({ className: css.value, elementRef: result }),
    button({ onClick: () => (count.value += 1) }, '+1'),
    button({ onClick: () => (count.value -= 1) }, '−1')
  );

  effect(() => {
    if (result.current) {
      result.current.replaceChildren(String(count.value));
    }
  });

  return view;
};
