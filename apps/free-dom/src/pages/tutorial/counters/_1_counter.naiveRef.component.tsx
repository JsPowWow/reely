import { button, createObjectReference, div, replaceChildrenOf } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { pipe } from '@reely/utils';

interface CounterProps {
  initialValue?: number;
}

export function CounterNaiveRef(props?: CounterProps) {
  const ref = createObjectReference<HTMLDivElement>();

  let counter = props?.initialValue ?? 0;

  return div(
    {
      styles: {
        padding: '10px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        border: '1px solid #ccc',
      },
    },
    <h2 styles={{ marginRight: 'auto' }}>Naive counter with `elementRef`</h2>,
    div(
      {
        id: 'counter1',
        elementRef: ref,
        styles: { padding: '10px' },
      },
      counter
    ),
    button(
      {
        onclick: () => {
          scopedLogger().log('click increment', ref.current);
          if (ref.current) {
            pipe(++counter, replaceChildrenOf(ref.current));
          }
        },
      },
      '👍'
    ),
    button(
      {
        onclick: () => {
          scopedLogger().log('click decrement', ref.current);
          if (ref.current) {
            pipe(--counter, replaceChildrenOf(ref.current));
          }
        },
      },
      '👎'
    )
  );
}
