import { button, createObjectReference, div, effect, output, signal } from '@reely/dommy';

import css from './tickets.module.css';

// A signal holds the state; an effect reads it, so it redraws the output after every change.
export const Tickets = (): HTMLElement => {
  const result = createObjectReference<HTMLOutputElement>();
  const tickets = signal(0);

  const view = div(
    { className: css.tickets },
    output({ className: css.value, elementRef: result }),
    button({ onClick: () => (tickets.value += 1) }, '+1'),
    button({ onClick: () => (tickets.value -= 1) }, '−1')
  );

  effect(() => {
    if (result.current) {
      result.current.replaceChildren(String(tickets.value));
    }
  });

  return view;
};
