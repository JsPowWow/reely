import { button, createElementRef, div, replaceChildrenOf, dommy, span } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { pipe } from '@reely/utils';

interface CounterProps {
  initialValue?: number;
}

export function Counter(props?: CounterProps): HTMLDivElement {
  const counter = dommy.state(props?.initialValue ?? 0);
  const ref = createElementRef<HTMLDivElement>();

  dommy.derive(() => {
    scopedLogger().log('counter.val: ', counter.val);
  });

  return div(
    div(
      {
        id: 'counter',
        elementRef: ref,
        styles: { width: '30px', height: '30px', display: 'inline-block' },
      },
      () => counter.val
      // () => div(counter.val) TODO AR error ?
    ),
    ' ',
    button(
      {
        click: () => {
          // ++counter.val;
          scopedLogger().log('click !', ref.current);
          ref.current && pipe(++counter.val, replaceChildrenOf(ref.current));
        },
      },
      '👍'
    ),
    button(
      {
        onclick: () => {
          --counter.val;
          scopedLogger().log('decrement counter by 1');
          //ref.current && pipe(--counter.val, replaceChildrenOf(ref.current));
        },
      },
      '👎'
    )
  );
}
