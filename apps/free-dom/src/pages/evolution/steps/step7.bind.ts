import { button, div, output, signal } from '@reely/dommy';

import css from './tickets.module.css';

// Pass the signal itself: dommy binds it to one text node and updates only that node.
export const Tickets = (): HTMLElement => {
  const tickets = signal(0);

  return div(
    { className: css.tickets },
    output({ className: css.value }, tickets),
    button({ onClick: () => (tickets.value += 1) }, '+1'),
    button({ onClick: () => (tickets.value -= 1) }, '−1')
  );
};
