import { button, div, output, replaceChildrenOf } from '@reely/dommy';

import css from './counter.module.css';

// A listener changes the page: redraw the output by hand after every click.
export const Counter = (): HTMLElement => {
  let count = 0;
  const value = output({ className: css.value }, count);

  const add = (step: number): void => {
    count += step;
    replaceChildrenOf(value)(count);
  };

  return div(
    { className: css.counter },
    value,
    button({ onClick: () => add(1) }, '+1'),
    button({ onClick: () => add(-1) }, '−1')
  );
};
