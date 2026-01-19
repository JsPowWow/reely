import { button, createElementRef, div, replaceChildrenOf, dommy } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { pipe } from '@reely/utils';

interface CounterProps {
  initialValue?: number;
}

export function DoubleCounter(props?: CounterProps): HTMLDivElement {
  const counter1 = dommy.state(props?.initialValue ?? 0);
  const ref1 = createElementRef<HTMLDivElement>();
  const counter2 = dommy.state(props?.initialValue ?? 0);
  const ref2 = createElementRef<HTMLDivElement>();
  return div(
    div({
      id: 'counter1',
      elementRef: ref1,
      children: counter1.val,
      styles: { width: '30px', height: '30px', display: 'inline-block' },
    }),
    ' ',
    button(
      {
        click: () => {
          ref1.current && pipe(++counter1.val, replaceChildrenOf(ref1.current));
        },
      },
      '👍'
    ),
    button(
      {
        click: () => {
          scopedLogger().log('decrement counter by 1');
          ref1.current && pipe(--counter1.val, replaceChildrenOf(ref1.current));
        },
      },
      '👎'
    ),
    /// ===
    div({
      id: 'counter2',
      elementRef: ref2,
      children: counter2.val,
      styles: { width: '30px', height: '30px', display: 'inline-block' },
    }),
    ' ',
    button(
      {
        click: () => {
          ref2.current && pipe(++counter2.val, replaceChildrenOf(ref2.current));
        },
      },
      '👍'
    ),
    button(
      {
        click: () => {
          scopedLogger().log('decrement counter by 1');
          ref2.current && pipe(--counter2.val, replaceChildrenOf(ref2.current));
        },
      },
      '👎'
    )
  );
}
