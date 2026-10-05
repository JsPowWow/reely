import { button, computed, div, output, signal } from '@reely/dommy';

import css from './tickets.module.css';

// Any function in a prop is bound like a signal: `disabled` follows the tickets, no computed needed.
export const Tickets = (): HTMLElement => {
  const tickets = signal(0);
  const plan = computed(() => {
    if (tickets.value === 0) {
      return 'empty';
    }
    return tickets.value === 1 ? 'single' : 'group';
  });

  return div(
    { className: css.tickets },
    output({ className: css.value, 'data-plan': plan }, tickets),
    button({ onClick: () => (tickets.value += 1) }, '+1'),
    button(
      {
        onClick: () => (tickets.value -= 1),
        disabled: () => tickets.value === 0,
      },
      '−1'
    )
  );
};
