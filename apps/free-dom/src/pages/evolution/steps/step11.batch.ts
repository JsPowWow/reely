import { batch, button, computed, div, output, p, signal } from '@reely/dommy';

import css from './tickets.module.css';

// `batch` applies both writes first, then runs each binding once: the summary is written once.
export const Tickets = (): HTMLElement => {
  const tickets = signal(0);
  const seatsLeft = signal(40);
  const plan = computed(() => {
    if (tickets.value === 0) {
      return 'empty';
    }
    return tickets.value === 1 ? 'single' : 'group';
  });
  const summary = computed(
    () =>
      `Tickets in your cart: ${tickets.value}, seats left: ${seatsLeft.value}`
  );

  const press = (step: number): void => {
    batch(() => {
      tickets.value += step;
      seatsLeft.value -= step;
    });
  };

  return div(
    { className: css.tickets },
    output({ className: css.value, 'data-plan': plan }, tickets),
    button({ onClick: () => press(1) }, '+1'),
    button(
      { onClick: () => press(-1), disabled: () => tickets.value === 0 },
      '−1'
    ),
    p({ className: css.summary }, summary)
  );
};
