import { button, createObjectReference, div, reelx, replaceChildrenOf } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { flow, pipe } from '@reely/utils';

interface CounterProps {
  initialValue?: number;
}

export function CounterNaiveReelx(props?: CounterProps) {
  const ref = createObjectReference<HTMLDivElement>();
  const counter = reelx(props?.initialValue ?? 0);

  const CounterView = () => <b>{counter()}</b>;

  reelx(counter /* shorthand to reelx(() => counter() */).subscribe((newVal) => {
    scopedLogger().info(`Derived counter new val: ${newVal}`);
    if (ref.current) {
      pipe(<CounterView />, replaceChildrenOf(ref.current));
    }
  });

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
    <h2 styles={{ marginRight: 'auto' }}>Naive counter `reelx.subscribe`</h2>,
    <div id='counter2' elementRef={ref} styles={{ padding: '10px' }}>
      <CounterView />
    </div>,
    <button onclick={flow(() => counter(counter() + 1), scopedLogger().logWith('info'))}>👍</button>,
    button({ onclick: flow(() => counter() - 1, counter, scopedLogger().logWith('info')) }, '👎')
  );
}
