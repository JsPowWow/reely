import { ul } from '@reely/dommy';

import css from '../../docs/demos/demos.module.css';

// `begin`/`end`, trimmed: one current parent for the whole module.
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

// A panel shows its title at once, then what its request brings. While the
// Inbox waits, the Calendar begins and becomes the current parent, so each
// panel's second line lands in the other one.
const panel = async (
  list: HTMLElement,
  title: string,
  load: () => Promise<string>
): Promise<void> => {
  begin(list);
  try {
    add(<li>{title}</li>);
    add(<li>{await load()}</li>);
  } finally {
    end();
  }
};

export const SharedParent = (): Node => {
  const inbox = ul({ aria: { ariaLabel: 'Inbox' } });
  const calendar = ul({ aria: { ariaLabel: 'Calendar' } });

  return (
    <div className={css.row}>
      <button
        onClick={() => {
          inbox.replaceChildren();
          calendar.replaceChildren();
          void Promise.all([
            panel(inbox, 'Inbox', async () => '3 unread'),
            panel(calendar, 'Calendar', async () => 'Stand-up at 10:00'),
          ]);
        }}
      >
        Load both panels
      </button>
      <p className={css.status}>
        <b>Inbox</b> panel
      </p>
      {inbox}
      <p className={css.status}>
        <b>Calendar</b> panel
      </p>
      {calendar}
    </div>
  );
};
