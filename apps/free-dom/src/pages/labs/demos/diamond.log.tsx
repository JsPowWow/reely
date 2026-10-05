import { For, computed, effect, signal } from '@reely/dommy';

import css from '../../docs/demos/demos.module.css';

// The diamond of the lab, in @reely/signals, read in the lab's own Angular
// style: the effect reads `count()` and `double()`, and every change logs one
// pair, never a stale one.
export const DiamondLog = (): Node => {
  const count = signal(1);
  const double = computed(() => count() * 2);
  const log = signal<readonly { run: number; pair: string }[]>([]);
  effect(() => {
    const pair = `${count()} / ${double()}`;
    log.update((runs) => [...runs, { run: runs.length, pair }]);
  });

  return (
    <div className={css.row}>
      <button onClick={() => count.update((n) => n + 1)}>count + 1</button>
      <ol className={css.status}>
        <For each={log} by={(entry) => entry.run}>
          {(entry) => <li>{entry().pair}</li>}
        </For>
      </ol>
    </div>
  );
};
