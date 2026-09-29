import { button, computed, div, output, p, signal } from '@reely/dommy';

import css from './tickets.module.css';

// A ticket in the cart is a seat taken from the hall: two signals change on every press, so the
// summary that reads both is written twice.
export const Tickets = (): HTMLElement => {
  const tickets = signal(0);
  const seatsLeft = signal(40);
  const plan = computed(() => (tickets.value === 0 ? 'empty' : tickets.value === 1 ? 'single' : 'group'));
  const summary = computed(() => `Tickets in your cart: ${tickets.value}, seats left: ${seatsLeft.value}`);

  const press = (step: number): void => {
    tickets.value += step;
    seatsLeft.value -= step;
  };

  return div(
    { className: css.tickets },
    output({ className: css.value, 'data-plan': plan }, tickets),
    button({ onClick: () => press(1) }, '+1'),
    button({ onClick: () => press(-1), disabled: () => tickets.value === 0 }, '−1'),
    p({ className: css.summary }, summary)
  );
};
