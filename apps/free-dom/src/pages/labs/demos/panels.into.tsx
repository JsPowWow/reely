import { div, li, ul } from '@reely/dommy';

import css from '../../docs/demos/demos.module.css';

// `into(parent, build)`: the block gets a tag that appends to `parent`, which
// its closure holds, so there is no current parent to share.
const into = <T extends Element>(
  parent: T,
  build: (row: (text: string) => void) => void
): T => {
  build((text) => parent.append(li(null, text)));
  return parent;
};

const panel = (title: string, load: () => Promise<string>): HTMLUListElement =>
  into(ul({ aria: { ariaLabel: title } }), async (row) => {
    row(title);
    row(await load());
  });

export const PanelsInto = (): Node => {
  const shown = div({ className: css.status });
  return (
    <div className={css.row}>
      <button
        onClick={() =>
          shown.replaceChildren(
            panel('Inbox', async () => '3 unread'),
            panel('Calendar', async () => 'Stand-up at 10:00')
          )
        }
      >
        Load both panels
      </button>
      {shown}
    </div>
  );
};
