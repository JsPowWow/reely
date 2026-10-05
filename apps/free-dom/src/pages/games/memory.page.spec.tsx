import { memoryFacts, memoryListings } from './memory/memory.sources';
import { MemoryPage } from './memory.page';
import { lineText } from '../../highlight/source.regions';
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

  it('opens on the game under its write board, then shows the modules that run it', async () => {
    const page = open();

    expect(document.title).toBe('Memory, a game without one if | reely');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toMatch(/^A memory game/);
    expect(page.host.querySelector('header a[href="/games/memory"]')?.getAttribute('aria-current')).toBe('true');
    expect(page.host.querySelectorAll('figure ul button')).toHaveLength(16);
    expect(texts(page.host, 'main section > header h2')).toEqual([
      'A state machine moves the game on',
      'Stores hold it, signals draw it',
      'The best ten',
      'The rules, without a page',
      'The code that just ran',
      'One dialog for both',
    ]);
    expect(page.host.querySelectorAll('main > section > div[class*="sourcePanel"]')).toHaveLength(0);
    await vi.dynamicImportSettled();
    expect(texts(page.host, 'main > section > div[class*="sourcePanel"] p span:last-child')).toEqual([
      'memory.machine.ts',
      'memory.game.tsx',
      'memory.leaderboard.ts',
      'memory.rules.ts',
      'memory.moments.tsx',
      'modal.tsx',
    ]);
    expect(
      Array.from(page.host.querySelectorAll('main > section:first-child li a'), (link) => link.getAttribute('href'))
    ).toEqual(['/state-machine', '/simple-store', '/signals', '/dommy']);
  });

  it('posts the figures counted from the sources it shows, once they arrive: not one if', async () => {
    const page = open();
    const shown = Object.values(memoryListings).flatMap(({ source }) => source.map(lineText));
    expect(texts(page.host, 'main dl dd').slice(0, 3)).toEqual(['–', '–', '–']);

    await vi.dynamicImportSettled();

    expect(memoryFacts.ifs).toBe(0);
    expect(shown.some((line) => /\bif\s*\(|\bswitch\s*\(/.test(line))).toBe(false);
    expect(texts(page.host, 'main dl dd').slice(0, 3)).toEqual(['0', String(memoryFacts.lines), '10']);
  });

  it('speaks Russian once it is chosen, and keeps the game as the reader left it', async () => {
    const page = open();
    const first = page.host.querySelector<HTMLButtonElement>('figure ul button');
    first?.click();

    chooseLocale('ru');
    await textsLoaded();

    expect(document.title).toBe('Мемори, игра без единого if | reely');
    expect(page.host.querySelector('h1')?.textContent).toBe('Мемори');
    expect(page.host.querySelector('figure ul button')).toBe(first);
    expect(first?.dataset['side']).toBe('up');
  });

  it('takes its description away when the page goes', () => {
    open();

    pages.splice(0).forEach((page) => page.dispose());

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });
});
