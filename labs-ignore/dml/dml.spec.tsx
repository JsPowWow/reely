import { h2, li, mount, p, section, signal, ul } from '@reely/dommy';

import { into } from './into';
import { begin, depth, end, tags } from './van';
import { add, within } from './within';

import type { ReelyNode } from '@reely/dommy';

const orders = [
  { id: 'A-1042', status: 'shipped' },
  { id: 'A-1043', status: 'cancelled' },
  { id: 'A-1044', status: 'packing' },
] as const;

const said = { shipped: 'on its way', packing: 'being packed' } as const;

const texts = (parent: ParentNode, selector: string): (string | null)[] =>
  Array.from(parent.querySelectorAll(selector), (node) => node.textContent);

const expected = ['A-1042: on its way', 'A-1044: being packed', '1 cancelled, not shown'];

describe('Variant A: a function that returns its children', () => {
  // no helper at all: statements build a list, and the list is the children
  const rows = (): ReelyNode[] => {
    const shown: ReelyNode[] = [];
    for (const { id, status } of orders) {
      if (status === 'cancelled') {
        continue;
      }
      shown.push(<li>{`${id}: ${said[status]}`}</li>);
    }
    const cancelled = orders.filter(({ status }) => status === 'cancelled').length;
    if (cancelled > 0) {
      shown.push(<li>{`${cancelled} cancelled, not shown`}</li>);
    }
    return shown;
  };

  it('takes every statement, and needs nothing from dommy', () => {
    expect(texts(ul(null, rows()), 'li')).toEqual(expected);
  });
});

describe('Variant B: `begin`/`end` with tags that append, as in van-dml', () => {
  afterEach(() => {
    while (depth() > 0) {
      end();
    }
  });

  it('reads like markup with statements in it', () => {
    const { li: row } = tags;
    const list = begin(ul());
    for (const { id, status } of orders) {
      if (status === 'cancelled') {
        continue;
      }
      row(`${id}: ${said[status]}`);
    }
    row('1 cancelled, not shown');
    end();

    expect(texts(list, 'li')).toEqual(expected);
  });

  it('nests: a `begin` inside a `begin` goes into it', () => {
    const page = begin(section());
    tags.h2('Running');
    begin(ul());
    tags.li('A-1042');
    end();
    end();

    expect(page.outerHTML).toBe('<section><h2>Running</h2><ul><li>A-1042</li></ul></section>');
  });

  it('leaves the parent current when an `end` is missing', () => {
    const list = begin(ul());
    tags.li('A-1042');

    const elsewhere = tags.p('meant for somewhere else');

    expect(elsewhere.parentElement).toBe(list);
  });

  it('shares the current parent across an `await`: the second panel opens inside the first, and the lines swap', async () => {
    const panel = async (title: string, load: () => Promise<string>): Promise<HTMLElement> => {
      const list = begin(ul());
      tags.li(title);
      tags.li(await load());
      end();
      return list;
    };

    const [inbox, calendar] = await Promise.all([
      panel('Inbox', async () => '3 unread'),
      panel('Calendar', async () => 'Stand-up at 10:00'),
    ]);

    expect(inbox.outerHTML).toBe(
      '<ul><li>Inbox</li><ul><li>Calendar</li><li>3 unread</li></ul><li>Stand-up at 10:00</li></ul>'
    );
    expect(calendar.parentElement).toBe(inbox);
  });
});

describe('Variant C: `into(parent, (tags) => …)`', () => {
  it('reads like van-dml, with the parent in the closure', () => {
    const list = into(ul(), ({ li: row }) => {
      for (const { id, status } of orders) {
        if (status === 'cancelled') {
          continue;
        }
        row(`${id}: ${said[status]}`);
      }
      row('1 cancelled, not shown');
    });

    expect(texts(list, 'li')).toEqual(expected);
  });

  it('nests through the tags it is given', () => {
    const page = into(section(), ({ h2: heading, ul: list }) => {
      heading('Running');
      into(list(), ({ li: row }) => row('A-1042'));
    });

    expect(page.outerHTML).toBe('<section><h2>Running</h2><ul><li>A-1042</li></ul></section>');
  });

  it('keeps each panel’s lines in its panel across an `await`', async () => {
    const panel = (title: string, load: () => Promise<string>): Promise<HTMLElement> =>
      new Promise((done) => {
        const list = into(ul(), async ({ li: row }) => {
          row(title);
          row(await load());
          done(list);
        });
      });

    const [inbox, calendar] = await Promise.all([
      panel('Inbox', async () => '3 unread'),
      panel('Calendar', async () => 'Stand-up at 10:00'),
    ]);

    expect(texts(inbox, 'li')).toEqual(['Inbox', '3 unread']);
    expect(texts(calendar, 'li')).toEqual(['Calendar', 'Stand-up at 10:00']);
  });

  it('keeps the bindings inside it point updates', () => {
    const leader = signal('Car 7');
    const host = document.createElement('div');
    mount(host, () => into(p(), ({ b }) => b(leader)));
    const text = host.querySelector('b')?.firstChild;

    leader.value = 'Car 3';

    expect(host.textContent).toBe('Car 3');
    expect(host.querySelector('b')?.firstChild).toBe(text);
  });

  it('moves a tag of the block that is also given as a child: plain factories are for children', () => {
    const list = into(ul(), ({ li: row }) => {
      row(h2(null, 'plain h2 child stays put'));
      // a block tag as a child is appended to the parent first, then moved into `row`'s li
      row(row('nested'));
    });

    expect(texts(list, ':scope > li')).toEqual(['plain h2 child stays put', 'nested']);
    expect(list.children).toHaveLength(2);
  });
});

describe('Variant D: `using within(parent)`', () => {
  it('appends to the current parent and closes with the block, even when it throws', () => {
    const list = ul();

    const build = (): void => {
      using _list = within(list);
      for (const { id } of orders) {
        add(li(null, id));
        if (id === 'A-1043') {
          throw new Error('stop');
        }
      }
    };

    expect(build).toThrow('stop');
    expect(texts(list, 'li')).toEqual(['A-1042', 'A-1043']);
  });
});
