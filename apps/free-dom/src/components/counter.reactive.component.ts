import { button, div, dommy } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';

interface CounterProps {
  initialValue?: number;
}

export function ReactiveCounter(props?: CounterProps): HTMLDivElement {
  const counter = dommy.state(props?.initialValue ?? 0);

  dommy.derive(() => {
    console.log('counter.val: ', counter.val);
  });

  return div(
    div({
      id: 'counter',
      styles: { width: '30px', height: '30px', display: 'inline-block' },
    }),
    () => ` ${counter.val}`,
    '❤️ ',
    counter,
    ' Reactively ',
    button(
      {
        onclick: () => {
          scopedLogger().log('Increment counter by 1');
          ++counter.val;
        },
      },
      '👍'
    ),
    button(
      {
        onclick: () => {
          scopedLogger().log('decrement counter by 1');
          --counter.val;
        },
      },
      '👎'
    )
  );
}
