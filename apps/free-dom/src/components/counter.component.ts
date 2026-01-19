import { button, createElementRef, div, replaceChildrenOf, dommy } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { pipe } from '@reely/utils';

interface CounterProps {
  initialValue?: number;
}

export function Counter(props?: CounterProps): HTMLDivElement {
  const counter = dommy.state(props?.initialValue ?? 0);
  const ref = createElementRef<HTMLDivElement>();

  dommy.derive(() => {
    console.log('counter.val: ', counter.val);
  });

  return div(
    div({
      id: 'counter',
      elementRef: ref,
      children: counter.val,
      styles: { width: '30px', height: '30px', display: 'inline-block' },
    }),
    ' ',
    button(
      {
        click: () => {
          ref.current && pipe(++counter.val, replaceChildrenOf(ref.current));
        },
      },
      '👍'
    ),
    button(
      {
        click: () => {
          scopedLogger().log('decrement counter by 1');
          ref.current && pipe(--counter.val, replaceChildrenOf(ref.current));
        },
      },
      '👎'
    )
  );
}
