import { MemoryGame } from './memory.game';
import { turnBackAfter } from './memory.machine';
import { sitePackages } from '../../../site/site.packages';
import { clickButton, mounted, stubDialogs } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

// a random source that always draws the first card left: the first eight packages, laid out twice in order
const keepOrder = (): number => 0;
const faces = sitePackages.slice(0, 8);

const memoryStorage = (): Pick<Storage, 'getItem' | 'setItem'> & {
  items: Map<string, string>;
} => {
  const items = new Map<string, string>();
  return {
    items,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
};

const play = (storage = memoryStorage(), now = (): number => new Date('2026-10-05T12:00:00').getTime()): Mounted =>
  mounted(() => <MemoryGame random={keepOrder} now={now} storage={storage} />);

const cards = (game: Mounted): HTMLButtonElement[] => Array.from(game.host.querySelectorAll('ul button'));
const sides = (game: Mounted): (string | undefined)[] => cards(game).map((card) => card.dataset['side']);
const turn = (game: Mounted, ...places: number[]): void => places.forEach((place) => cards(game)[place]?.click());
const counter = (game: Mounted, label: string): string | null | undefined =>
  Array.from(game.host.querySelectorAll('dt')).find((dt) => dt.textContent === label)?.nextElementSibling?.textContent;
const dialogs = (game: Mounted): HTMLDialogElement[] => Array.from(game.host.querySelectorAll('dialog'));
const winAll = (game: Mounted): void => faces.forEach((_face, place) => turn(game, place, place + 8));

describe('memory game', () => {
  beforeAll(stubDialogs);

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lays out sixteen cards face down, eight packages twice, with no moves and no pairs', () => {
    const game = play();

    expect(sides(game)).toEqual(Array(16).fill('down'));
    expect(cards(game).map((card) => card.querySelector('[class*="name"]')?.textContent)).toEqual([...faces, ...faces]);
    expect(cards(game)[0]?.getAttribute('aria-label')).toBe('Card 1, face down');
    expect(counter(game, 'Moves')).toBe('0');
    expect(counter(game, 'Pairs')).toBe('0/8');
  });

  it('keeps a found pair open and counts one move and one pair', () => {
    const game = play();

    turn(game, 0);
    expect(counter(game, 'Moves')).toBe('0');
    turn(game, 8);

    expect(sides(game)[0]).toBe('found');
    expect(sides(game)[8]).toBe('found');
    expect(cards(game)[0]?.getAttribute('aria-label')).toBe('Card 1, basics, found');
    expect(counter(game, 'Moves')).toBe('1');
    expect(counter(game, 'Pairs')).toBe('1/8');
  });

  it('turns a wrong pair back after a second, ignoring every click until then', () => {
    const game = play();

    turn(game, 0, 1, 2, 0);
    expect(sides(game).slice(0, 3)).toEqual(['up', 'up', 'down']);
    expect(counter(game, 'Moves')).toBe('1');
    expect(game.host.querySelector('ul')?.getAttribute('aria-busy')).toBe('true');

    vi.advanceTimersByTime(turnBackAfter - 1);
    expect(sides(game)[0]).toBe('up');
    vi.advanceTimersByTime(1);

    expect(sides(game).slice(0, 3)).toEqual(['down', 'down', 'down']);
    expect(game.host.querySelector('ul')?.getAttribute('aria-busy')).toBe('false');
  });

  it('starts a new game without a reload: new cards, counters at zero, the wrong pair’s timer cancelled', () => {
    const game = play();
    turn(game, 0, 8, 1, 2);
    const before = cards(game)[0];

    clickButton(game.host, 'New game');
    turn(game, 3);
    vi.advanceTimersByTime(turnBackAfter);

    expect(cards(game)[0]).not.toBe(before);
    expect(sides(game)).toEqual([...Array(3).fill('down'), 'up', ...Array(12).fill('down')]);
    expect(counter(game, 'Moves')).toBe('0');
    expect(counter(game, 'Pairs')).toBe('0/8');
  });

  it('opens the victory dialog on the last pair and posts the win to the leaderboard once', () => {
    const storage = memoryStorage();
    const game = play(storage);
    turn(game, 0, 1);
    vi.advanceTimersByTime(turnBackAfter);

    winAll(game);
    turn(game, 0);
    const [victory] = dialogs(game);

    expect(victory?.open).toBe(true);
    expect(victory?.textContent).toContain('9 moves');
    expect(victory?.textContent).toContain('1 on the leaderboard');
    expect(JSON.parse(storage.items.get('reely.memory.leaderboard') ?? '')).toEqual([
      { moves: 9, at: new Date('2026-10-05T12:00:00').getTime() },
    ]);
  });

  it('closes a dialog with its button, Escape or a click on the page behind it', () => {
    const game = play();
    winAll(game);
    const [victory] = dialogs(game);

    clickButton(victory ?? game.host, 'Close');
    expect(victory?.open).toBe(false);

    clickButton(game.host, 'Leaderboard');
    const board = dialogs(game)[1];
    expect(board?.open).toBe(true);
    board?.close(); // what Escape does
    expect(board?.open).toBe(false);
    clickButton(game.host, 'Leaderboard');
    expect(board?.open).toBe(true);
    board?.click();
    expect(board?.open).toBe(false);

    clickButton(game.host, 'Leaderboard');
    board?.querySelector('h2')?.click();
    expect(board?.open).toBe(true);
    board?.click();
    expect(board?.open).toBe(false);
  });

  it('starts a new game from the victory dialog and closes it', () => {
    const game = play();
    winAll(game);
    const [victory] = dialogs(game);

    clickButton(victory ?? game.host, 'New game');

    expect(victory?.open).toBe(false);
    expect(sides(game)).toEqual(Array(16).fill('down'));
  });

  it('shows the leaderboard without stopping the game: the wrong pair still turns back', () => {
    const game = play();
    turn(game, 0, 1);

    clickButton(game.host, 'Leaderboard');
    vi.advanceTimersByTime(turnBackAfter);

    expect(dialogs(game)[1]?.textContent).toContain('No wins yet.');
    expect(sides(game).slice(0, 2)).toEqual(['down', 'down']);
    expect(counter(game, 'Moves')).toBe('1');
  });

  it('lists the best wins kept in storage: place, moves and day, fewest moves first', () => {
    const storage = memoryStorage();
    storage.setItem(
      'reely.memory.leaderboard',
      JSON.stringify([
        { moves: 9, at: new Date('2026-09-30T10:00:00').getTime() },
        { moves: 14, at: new Date('2026-10-01T10:00:00').getTime() },
      ])
    );
    const game = play(storage);
    turn(game, 0, 1);
    vi.advanceTimersByTime(turnBackAfter);
    winAll(game);

    const rows = Array.from(dialogs(game)[1]?.querySelectorAll('tbody tr') ?? [], (row) =>
      Array.from(row.querySelectorAll('td'), (cell) => cell.textContent)
    );

    expect(rows).toEqual([
      ['1', '9', '30.09.2026'],
      ['2', '9', '05.10.2026'],
      ['3', '14', '01.10.2026'],
    ]);
    expect(dialogs(game)[1]?.querySelector('tr[aria-current="true"] td')?.textContent).toBe('2');
  });

  it('shows, when asked, the part of the machine that ran for the last move', async () => {
    const game = play();
    const code = (): string | undefined =>
      Array.from(game.host.querySelectorAll('pre code'), (line) => line.textContent).join('\n');
    const caption = (): string | null | undefined => game.host.querySelector('details p')?.textContent;

    const details = game.host.querySelector('details');
    expect(game.host.querySelector('pre')).toBeNull();
    if (details) {
      details.open = true;
      details.dispatchEvent(new Event('toggle'));
    }
    await vi.dynamicImportSettled();
    expect(caption()).toContain('New game: deal is taken from any state');

    turn(game, 0, 1);
    expect(caption()).toContain('No match: entering wrongPair starts the timer');
    expect(code()).toContain('wrongPair: {');

    turn(game, 2);
    expect(caption()).toContain('Refused: wrongPair takes this card nowhere');

    clickButton(game.host, 'New game');
    expect(caption()).toContain('New game: deal is taken from any state');
    expect(code()).toContain('deal: {');
    expect(code()).not.toContain('#region');
  });

  it('cancels the wrong pair’s timer when the game is disposed', () => {
    const game = play();
    turn(game, 0, 1);

    game.dispose();

    expect(vi.getTimerCount()).toBe(0);
  });
});
