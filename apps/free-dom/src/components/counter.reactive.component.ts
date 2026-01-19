import { button as bbb, div as ddd, dommy } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';

interface CounterProps {
  initialValue?: number;
}

export function ReactiveCounter(props?: CounterProps): HTMLDivElement {
  const counter = dommy.state(props?.initialValue ?? 0);

  dommy.derive(() => {
    console.log('counter.val: ', counter.val);
  });

  const isDommy = true;

  const { button, div } = isDommy ? dommy.tags : { div: ddd, button: bbb };

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
