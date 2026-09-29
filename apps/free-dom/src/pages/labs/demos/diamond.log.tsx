import { For, computed, effect, signal } from '@reely/dommy';

import css from '../../docs/demos/demos.module.css';

// The diamond of the lab, in reelx: the effect reads `count` and `double`, and every change logs
// one pair, never a stale one.
export const DiamondLog = (): Node => {
  const count = signal(1);
  const double = computed(() => count.value * 2);
  const log = signal<readonly { run: number; pair: string }[]>([]);
  effect(() => {
    const pair = `${count.value} / ${double.value}`;
    log.value = [...log.peek(), { run: log.peek().length, pair }];
  });

  return (
    <div className={css.row}>
      <button onClick={() => (count.value += 1)}>count + 1</button>
      <ol className={css.status}>
        <For each={log} by={(entry) => entry.run}>
          {(entry) => <li>{entry().pair}</li>}
        </For>
      </ol>
    </div>
  );
};
