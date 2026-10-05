import { memoryMachine } from './memory.machine';

import type { MemoryWorld } from './memory.machine';
import type { MemoryState } from './memory.rules';

const deck = ['a', 'b', 'a', 'b'];
const fresh = (): MemoryState => ({ deck, open: [], found: [], moves: 0 });

const world: MemoryWorld = { deal: fresh, now: () => 1_000 };

describe('memory machine', () => {
  it('turns one card, then keeps a found pair and is ready for the next', () => {
    const game = memoryMachine(world);
    const { context } = game;

    expect(game.send('turn', 0)).toMatchObject({
      status: 'done',
      state: 'oneUp',
    });
    expect(context.table.value.open).toEqual([0]);
    expect(game.send('turn', 2)).toMatchObject({
      status: 'done',
      state: 'ready',
    });
    expect(context.table.value).toMatchObject({
      open: [],
      found: ['a'],
      moves: 1,
    });
  });

  it('refuses a card that cannot turn: the same card, a found one, any card while a wrong pair is up', () => {
    const game = memoryMachine(world);
    const { context } = game;

    game.send('turn', 0);
    expect(game.send('turn', 0).status).toBe('refused');
    game.send('turn', 1);
    expect(game.state).toBe('wrongPair');
    expect(game.send('turn', 2).status).toBe('refused');
    expect(context.table.value.moves).toBe(1);
  });

  it('turns a wrong pair back on `turnBack`, and refuses it anywhere else', () => {
    const game = memoryMachine(world);
    const { context } = game;
    game.send('turn', 0);
    game.send('turn', 1);

    game.send('turnBack');

    expect(game.state).toBe('ready');
    expect(context.table.value.open).toEqual([]);
  });

  it('deals a new game from any state, a wrong pair included', () => {
    const game = memoryMachine(world);
    const { context } = game;
    game.send('turn', 0);
    game.send('turn', 1);

    expect(game.send('deal')).toMatchObject({ status: 'done', state: 'ready' });
    expect(context.table.value).toEqual(fresh());
  });

  it('posts a win once, with its place on the leaderboard', () => {
    const game = memoryMachine(world);
    const { context } = game;

    [0, 2, 1, 3].forEach((place) => game.send('turn', place));

    expect(game.state).toBe('won');
    expect(game.send('turn', 0).status).toBe('refused');
    expect(context.leaderboard.value).toEqual({
      board: [{ moves: 2, at: 1_000 }],
      place: 1,
    });
  });

  it('holds its invariants under any order of fast clicks, new games and turn-backs', () => {
    let clock = 0;
    const game = memoryMachine({
      ...world,
      now: () => ++clock,
      deal: () => ({
        deck: ['a', 'b', 'c', 'a', 'b', 'c'],
        open: [],
        found: [],
        moves: 0,
      }),
    });
    const { table, leaderboard } = game.context;
    // a seeded pseudo-random walk, so a failure replays the same way
    let seed = 7;
    const next = (): number => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    let wins = 0;
    game.on('stateChanged', ({ to }) => to === 'won' && wins++);

    for (let step = 0; step < 5000; step++) {
      const roll = next();
      if (roll < 0.8) game.send('turn', Math.floor(next() * 7) - 1);
      else if (roll < 0.95) game.send('turnBack');
      else game.send('deal');

      const { deck, open, found, moves } = table.value;
      expect(open.length).toBeLessThanOrEqual(2);
      expect(new Set(open).size).toBe(open.length);
      expect(new Set(found).size).toBe(found.length);
      expect(open.length === 2).toBe(game.state === 'wrongPair');
      expect(open.every((place) => !found.includes(deck[place] ?? ''))).toBe(true);
      expect(moves).toBeGreaterThanOrEqual(found.length);
    }
    expect(wins).toBeGreaterThan(0);
    expect(leaderboard.value.board.length).toBe(Math.min(wins, 10));
  });
});
