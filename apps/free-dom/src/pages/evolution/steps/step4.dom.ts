import { button, div, output } from '@reely/dommy';

import css from './tickets.module.css';

// Tickets for a concert: `elementRef` hands over the output, and a listener redraws it by hand after every click.
export const Tickets = (): HTMLElement => {
  let result: HTMLOutputElement | undefined;
  let tickets = 0;

  const add = (step: number): void => {
    tickets += step;
    result?.replaceChildren(String(tickets));
  };

  return div(
    { className: css.tickets },
    output(
      {
        className: css.value,
        elementRef: (element) => {
          result = element;
        },
      },
      tickets
    ),
    button({ onClick: () => add(1) }, '+1'),
    button({ onClick: () => add(-1) }, '−1')
  );
};
