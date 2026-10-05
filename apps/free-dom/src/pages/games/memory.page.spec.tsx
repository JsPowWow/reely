import { MemoryPage } from './memory.page';
import { chooseLocale } from '../../i18n/locale';
import { textsLoaded } from '../../i18n/localized';
import { mounted } from '../../testing/dom.testing';

const texts = (root: ParentNode, selector: string): (string | null)[] =>
  Array.from(root.querySelectorAll(selector), (node) => node.textContent);

describe('memory page', () => {
  afterEach(() => chooseLocale('en'));

  it('opens on the game under its write board, then shows the modules that run it', () => {
    const page = mounted(() => <MemoryPage />);

    expect(document.title).toBe('Memory | reely');
    expect(page.host.querySelector('header a[href="/games/memory"]')?.getAttribute('aria-current')).toBe('true');
    expect(page.host.querySelectorAll('figure ul button')).toHaveLength(16);
    expect(texts(page.host, 'main section > header h2')).toEqual([
      'The game, on the page',
      'The rules, without a page',
      'The best ten',
      'One dialog for both',
    ]);
    expect(texts(page.host, 'main section p[class*="sourceCaption"] span:last-child')).toEqual([
      'memory.game.tsx',
      'memory.rules.ts',
      'memory.leaderboard.ts',
      'modal.tsx',
    ]);
    expect(Array.from(page.host.querySelectorAll('h1 ~ div li a'), (link) => link.getAttribute('href'))).toEqual([
      '/signals',
      '/dommy',
      '/dommy-kit',
    ]);
  });

  it('speaks Russian once it is chosen, and keeps the game as the reader left it', async () => {
    const page = mounted(() => <MemoryPage />);
    const first = page.host.querySelector<HTMLButtonElement>('figure ul button');
    first?.click();

    chooseLocale('ru');
    await textsLoaded();

    expect(document.title).toBe('Мемори | reely');
    expect(page.host.querySelector('h1')?.textContent).toBe('Мемори');
    expect(page.host.querySelector('figure ul button')).toBe(first);
    expect(first?.dataset['side']).toBe('up');
  });
});
