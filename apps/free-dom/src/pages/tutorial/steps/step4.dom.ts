import { button, createObjectReference, div, output, replaceChildrenOf } from '@reely/dommy';

import css from './counter.module.css';

// `elementRef` hands over the output element; a listener redraws it by hand after every click.
export const Counter = (): HTMLElement => {
  const value = createObjectReference<HTMLOutputElement>();
  let count = 0;

  const add = (step: number): void => {
    count += step;
    if (value.current) {
      replaceChildrenOf(value.current)(count);
    }
  };

  return div(
    { className: css.counter },
    output({ className: css.value, elementRef: value }, count),
    button({ onClick: () => add(1) }, '+1'),
    button({ onClick: () => add(-1) }, '−1')
  );
};
