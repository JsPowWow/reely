import { ul } from '@reely/dommy';

import css from '../../docs/demos/demos.module.css';

// van_dml's `begin`/`end`, trimmed: one current parent for the whole module.
const parents: HTMLElement[] = [];
const begin = (parent: HTMLElement): void => {
  parents.push(parent);
};
const end = (): void => {
  parents.pop();
};
const add = (child: Node): void => {
  parents.at(-1)?.append(child);
};

// Each build adds one item, waits, then adds another. By then the other build's list is current,
// and each `end` pops the other's parent: every list gets the other build's second item.
const build = async (list: HTMLElement, name: string): Promise<void> => {
  begin(list);
  try {
    add(<li>{`${name} 1`}</li>);
    await Promise.resolve();
    add(<li>{`${name} 2`}</li>);
  } finally {
    end();
  }
};

export const SharedParent = (): Node => {
  const first = ul({ aria: { ariaLabel: 'Built by A' } });
  const second = ul({ aria: { ariaLabel: 'Built by B' } });

  return (
    <div className={css.row}>
      <button
        onClick={() => {
          first.replaceChildren();
          second.replaceChildren();
          void Promise.all([build(first, 'A'), build(second, 'B')]);
        }}
      >
        Build both
      </button>
      <p className={css.status}>
        <b>List A</b>, built by A
      </p>
      {first}
      <p className={css.status}>
        <b>List B</b>, built by B
      </p>
      {second}
    </div>
  );
};
