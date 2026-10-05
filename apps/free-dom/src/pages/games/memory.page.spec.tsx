import { MemoryPage } from './memory.page';
import { chooseLocale } from '../../i18n/locale';
import { textsLoaded } from '../../i18n/localized';
import { mounted, stubDialogs } from '../../testing/dom.testing';

import type { Mounted } from '../../testing/dom.testing';

const texts = (root: ParentNode, selector: string): (string | null)[] =>
  Array.from(root.querySelectorAll(selector), (node) => node.textContent);

const pages: Mounted[] = [];
const open = (): Mounted => {
  const page = mounted(() => <MemoryPage />);
  pages.push(page);
  return page;
};

describe('memory page', () => {
  beforeAll(stubDialogs);
  afterEach(() => {
    chooseLocale('en');
    pages.splice(0).forEach((page) => page.dispose());
  });

  it('opens on the game under its write board, then tells how it is built', async () => {
    const page = open();

    expect(document.title).toBe('Memory game, built step by step | reely');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toMatch(/^A memory game/);
    expect(page.host.querySelector('header a[href="/games/memory"]')?.getAttribute('aria-current')).toBe('true');
    expect(page.host.querySelectorAll('figure ul button')).toHaveLength(16);
    expect(page.host.querySelector('article h2')?.textContent).toBe('How the game is built');
    expect(texts(page.host, 'article section h3')).toEqual([
      'Step 1. Rules first, screen later',
      'Step 2. Keep the state in one place',
      'Step 3. Give each moment of the game a name',
      'Step 4. Let time live outside',
      'Step 5. A card is a button and a bit of CSS',
      'Step 6. The best ten',
      'Step 7. Use the dialog the browser already has',
      'What we ended up with',
    ]);
    expect(
      Array.from(page.host.querySelectorAll('main > section:first-child li a'), (link) => link.getAttribute('href'))
    ).toEqual(['/state-machine', '/signals', '/dommy', '/dommy-kit', '/logger']);
  });

  it('quotes real code in every snippet once the sources arrive', async () => {
    const page = open();
    expect(page.host.querySelectorAll('article pre')).toHaveLength(0);

    await vi.dynamicImportSettled();

    const panes = Array.from(page.host.querySelectorAll('article pre'));
    expect(panes).toHaveLength(14);
    expect(panes.filter((pane) => (pane.textContent ?? '').trim().length < 40)).toEqual([]);
    expect(panes.some((pane) => /#(end)?region/.test(pane.textContent ?? ''))).toBe(false);
    expect(
      panes.some((pane) => /initial: 'ready'[\s\S]*wrongPair[\s\S]*won[\s\S]*logger/.test(pane.textContent ?? ''))
    ).toBe(true);
    expect(page.host.querySelector('article svg[role="img"]')?.getAttribute('aria-label')).toBeTruthy();
  });

  it('speaks Russian once it is chosen, and keeps the game as the reader left it', async () => {
    const page = open();
    const first = page.host.querySelector<HTMLButtonElement>('figure ul button');
    first?.click();

    chooseLocale('ru');
    await textsLoaded();

    expect(document.title).toBe('Memory game, шаг за шагом | reely');
    expect(page.host.querySelector('h1')?.textContent).toBe('Memory game');
    expect(page.host.querySelector('figure ul button')).toBe(first);
    expect(first?.dataset['side']).toBe('up');
    expect(page.host.querySelector('article h2')?.textContent).toBe('Как устроена игра');
    await vi.dynamicImportSettled();
    expect(page.host.querySelectorAll('article pre')).toHaveLength(14);
  });

  it('keeps the best ten in localStorage, where a reload finds them', () => {
    localStorage.clear();
    const page = open();
    const cards = Array.from(page.host.querySelectorAll<HTMLButtonElement>('figure ul button'));
    const faces = cards.map((card) => card.querySelector('[class*="name"]')?.textContent);
    cards.forEach(
      (card, place) =>
        card.dataset['side'] === 'down' &&
        [card, cards[faces.indexOf(faces[place], place + 1)]].forEach((one) => one?.click())
    );

    expect(JSON.parse(localStorage.getItem('reely.memory.leaderboard') ?? '[]')).toEqual([
      { moves: 8, at: expect.any(Number) },
    ]);
  });

  it('takes its description away when the page goes', () => {
    open();

    pages.splice(0).forEach((page) => page.dispose());

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });
});
