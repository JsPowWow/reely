import { memoryMachine, turnBackAfter } from './memory.machine';

import type { MemoryWorld } from './memory.machine';
import type { MemoryState } from './memory.rules';

const deck = ['a', 'b', 'a', 'b'];
const fresh = (): MemoryState => ({ deck, open: [], found: [], moves: 0 });

const setUp = (): { world: MemoryWorld; timers: Map<number, VoidFunction> } => {
  const timers = new Map<number, VoidFunction>();
  let next = 0;
  const world: MemoryWorld = {
    deal: fresh,
    now: () => 1_000,
    later: (ms: number, fn: VoidFunction): VoidFunction => {
      const id = ++next;
      expect(ms).toBe(turnBackAfter);
      timers.set(id, fn);
      return () => void timers.delete(id);
    },
  };
  return { world, timers };
};

const fire = (timers: Map<number, VoidFunction>): void =>
  [...timers.values()].forEach((fn) => fn());

describe('memory machine', () => {
  it('turns one card, then keeps a found pair and is ready for the next', () => {
    const { world } = setUp();
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
    const { world } = setUp();
    const game = memoryMachine(world);
    const { context } = game;

    game.send('turn', 0);
    expect(game.send('turn', 0).status).toBe('refused');
    game.send('turn', 1);
    expect(game.state).toBe('wrongPair');
    expect(game.send('turn', 2).status).toBe('refused');
    expect(context.table.value.moves).toBe(1);
  });

  it('turns a wrong pair back when its timer fires', () => {
    const { world, timers } = setUp();
    const game = memoryMachine(world);
    const { context } = game;
    game.send('turn', 0);
    game.send('turn', 1);

    fire(timers);

    expect(game.state).toBe('ready');
    expect(context.table.value.open).toEqual([]);
    expect(timers.size).toBe(0);
  });

  it('deals a new game from any state, cancelling the wrong pair’s timer', () => {
    const { world, timers } = setUp();
    const game = memoryMachine(world);
    const { context } = game;
    game.send('turn', 0);
    game.send('turn', 1);

    expect(game.send('deal')).toMatchObject({ status: 'done', state: 'ready' });
    expect(timers.size).toBe(0);
    expect(context.table.value).toEqual(fresh());
  });

  it('posts a win once, with its place on the leaderboard', () => {
    const { world } = setUp();
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
});
