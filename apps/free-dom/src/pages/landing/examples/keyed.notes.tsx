import { For, signal } from '@reely/dommy';

import css from './examples.module.css';

interface Task {
  id: number;
  title: string;
}

const tasks: readonly Task[] = [
  { id: 1, title: 'Write the docs' },
  { id: 2, title: 'Fix the bug' },
  { id: 3, title: 'Review the pull request' },
  { id: 4, title: 'Release' },
];

// `For` keeps one row per key and moves it when the order changes: what you typed moves with it.
export const KeyedNotes = (): Node => {
  const rows = signal(tasks);

  return (
    <div className={css.stack}>
      <ol className={css.list}>
        <For each={rows} by={(task) => task.id}>
          {(task) => (
            <li className={css.item}>
              <span className={css.title}>{() => task().title}</span>
              <input placeholder='Your note' aria={{ ariaLabel: () => `Note on ${task().title}` }} />
            </li>
          )}
        </For>
      </ol>
      <div className={css.row}>
        <button onClick={() => (rows.value = rows.value.toReversed())}>Reverse</button>
        <button onClick={() => (rows.value = [...rows.value.slice(1), ...rows.value.slice(0, 1)])}>
          First to last
        </button>
      </div>
    </div>
  );
};
