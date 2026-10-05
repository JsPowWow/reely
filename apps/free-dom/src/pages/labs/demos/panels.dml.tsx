import { div, li, ul } from '@reely/dommy';

import css from '../../docs/demos/demos.module.css';

// van-dml's `begin`/`end` again: one current parent for the whole module.
const parents: Element[] = [];
const begin = <T extends Element>(parent: T): T => {
  parents.at(-1)?.append(parent);
  parents.push(parent);
  return parent;
};
const end = (): void => {
  parents.pop();
};
const row = (text: string): void => {
  parents.at(-1)?.append(li(null, text));
};

// A panel shows its title at once, then what its request brings. While the
// Inbox waits, the Calendar begins inside it, and each awaited line lands in
// whichever parent is current by then.
const panel = async (
  title: string,
  load: () => Promise<string>
): Promise<HTMLUListElement> => {
  const list = begin(ul({ aria: { ariaLabel: title } }));
  row(title);
  row(await load());
  end();
  return list;
};

export const PanelsDml = (): Node => {
  const shown = div({ className: css.status });
  return (
    <div className={css.row}>
      <button
        onClick={() => {
          void Promise.all([
            panel('Inbox', async () => '3 unread'),
            panel('Calendar', async () => 'Stand-up at 10:00'),
          ]).then(([inbox]) => shown.replaceChildren(inbox));
        }}
      >
        Load both panels
      </button>
      {shown}
    </div>
  );
};
