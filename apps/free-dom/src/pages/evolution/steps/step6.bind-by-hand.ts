import { button, div, effect, output, signal } from '@reely/dommy';

import css from './tickets.module.css';

// A function ref gets the output once it exists; subscribing it to the signal is a binding by hand.
export const Tickets = (): HTMLElement => {
  const tickets = signal(0);

  const showTickets = (element: HTMLOutputElement): void => {
    effect(() => {
      element.textContent = String(tickets.value);
    });
  };

  return div(
    { className: css.tickets },
    output({ className: css.value, elementRef: showTickets }),
    button({ onClick: () => (tickets.value += 1) }, '+1'),
    button({ onClick: () => (tickets.value -= 1) }, '−1')
  );
};
