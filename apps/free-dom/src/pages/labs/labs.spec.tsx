import { mount } from '@reely/dommy';

import { DiamondLog } from './demos/diamond.log';
import { OrdersDml } from './demos/orders.dml';
import { PanelsDml } from './demos/panels.dml';
import { PanelsInto } from './demos/panels.into';
import { LabsPage } from './labs.page';
import { chooseLocale } from '../../i18n/locale';
import { textsLoaded } from '../../i18n/localized';

const render = (view: () => Node): HTMLElement => {
  const host = document.createElement('div');
  mount(host, view);
  return host;
};

const click = (host: Element, text: string): void => {
  Array.from(host.querySelectorAll('button'))
    .find((button) => button.textContent === text)
    ?.click();
};

const texts = (root: ParentNode, selector: string): (string | null)[] =>
  Array.from(root.querySelectorAll(selector), (node) => node.textContent);

describe('labs', () => {
  afterEach(() => chooseLocale('en'));

  it('shows each lab with its question, live demos and verdict', () => {
    const page = render(() => <LabsPage />);

    expect(document.title).toBe('Labs | reely');
    expect(texts(page, 'main h2')).toEqual([
      'Statements inside markup',
      'A signal graph in the shape of Angular’s',
      'Which signal core to ship',
    ]);
    expect(page.querySelectorAll('figure')).toHaveLength(4);
    expect(page.querySelector('header a[href="/labs"]')?.getAttribute('aria-current')).toBe('true');
  });

  it('speaks Russian once it is chosen, and keeps the demos as the reader left them', async () => {
    const page = render(() => <LabsPage />);
    click(page, 'count + 1');
    const log = page.querySelector('ol');

    chooseLocale('ru');
    await textsLoaded();

    expect(document.title).toBe('Лаборатория | reely');
    expect(texts(page, 'main h2')).toEqual([
      'Операторы внутри разметки',
      'Граф сигналов по образцу Angular',
      'Какое ядро сигналов выпускать',
    ]);
    expect(texts(page, 'main h3')).toEqual(['Вердикт', 'Вердикт', 'Вердикт']);
    expect(page.querySelector('table caption')?.textContent).toContain('Три ядра');
    expect(page.querySelectorAll('figure')).toHaveLength(4);
    expect(page.querySelector('ol')).toBe(log);
    expect(texts(log ?? page, 'li')).toEqual(['1 / 2', '2 / 4']);
  });

  it('weighs and times the three signal cores side by side, the chosen one last', () => {
    const page = render(() => <LabsPage />);
    const table = page.querySelector('section[aria-labelledby="signal-cores"] table');
    const size = Array.from(table?.querySelectorAll('tbody tr') ?? []).find((row) =>
      row.querySelector('th')?.textContent?.startsWith('Size')
    );

    expect(texts(table ?? page, 'thead th')).toEqual(['act', 'restructured', 'push-pull']);
    expect(table?.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(texts(size ?? page, 'td')).toEqual(['1509 B', '1720 B', '1825 B']);
  });

  it('builds a list with `for`, `continue`, `switch` and `if` between `begin` and `end`', () => {
    const list = render(OrdersDml);

    expect(texts(list, 'li')).toEqual([
      'A-1042: on its way',
      'A-1044: being packed',
      'A-1045: on its way',
      '1 cancelled, not shown',
    ]);
  });

  const loadBoth = async (host: Element): Promise<void> => {
    click(host, 'Load both panels');
    await new Promise((done) => setTimeout(done, 0));
  };

  it('shows begin/end across an `await`: the second panel opens inside the first', async () => {
    const host = render(PanelsDml);

    await loadBoth(host);

    expect(host.querySelector('[class*="status"]')?.innerHTML).toBe(
      '<ul aria-label="Inbox"><li>Inbox</li><ul aria-label="Calendar"><li>Calendar</li><li>3 unread</li></ul><li>Stand-up at 10:00</li></ul>'
    );
  });

  it('keeps each panel’s lines in its own list with `into`', async () => {
    const host = render(PanelsInto);

    await loadBoth(host);
    const [inbox, calendar] = Array.from(host.querySelectorAll('ul'));

    expect(texts(inbox ?? host, 'li')).toEqual(['Inbox', '3 unread']);
    expect(texts(calendar ?? host, 'li')).toEqual(['Calendar', 'Stand-up at 10:00']);
  });

  it('logs one current pair per change of the diamond', () => {
    const host = render(DiamondLog);

    click(host, 'count + 1');
    click(host, 'count + 1');

    expect(texts(host, 'li')).toEqual(['1 / 2', '2 / 4', '3 / 6']);
  });
});
