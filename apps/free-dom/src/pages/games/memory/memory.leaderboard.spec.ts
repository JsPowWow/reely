import { formatDay, isMemoryResults, postResult } from './memory.leaderboard';

import type { MemoryResult } from './memory.leaderboard';

const day = (date: string): number => new Date(`${date}T12:00:00`).getTime();

describe('memory leaderboard', () => {
  it('ranks by moves, then by the earlier win, and tells the place of the new one', () => {
    const board: MemoryResult[] = [
      { moves: 12, at: day('2026-10-02') },
      { moves: 9, at: day('2026-10-03') },
    ];

    const posted = postResult(board, { moves: 12, at: day('2026-10-01') });

    expect(posted.board).toEqual([
      { moves: 9, at: day('2026-10-03') },
      { moves: 12, at: day('2026-10-01') },
      { moves: 12, at: day('2026-10-02') },
    ]);
    expect(posted.place).toBe(2);
  });

  it('keeps the ten best, and gives a result outside them no place', () => {
    const full = Array.from({ length: 10 }, (_item, index) => ({ moves: 8 + index, at: day('2026-10-01') }));

    const worse = postResult(full, { moves: 30, at: day('2026-10-05') });
    const better = postResult(full, { moves: 8, at: day('2026-10-05') });

    expect(worse.place).toBeUndefined();
    expect(worse.board).toEqual(full);
    expect(better.place).toBe(2);
    expect(better.board).toHaveLength(10);
    expect(better.board.at(-1)?.moves).toBe(16);
  });

  it('does not post the same win twice', () => {
    const win = { moves: 10, at: day('2026-10-05') };

    const once = postResult([], win);
    const twice = postResult(once.board, win);

    expect(twice.board).toEqual([win]);
    expect(twice.place).toBe(1);
  });

  it('writes a day as DD.MM.YYYY', () => {
    expect(formatDay(day('2026-03-07'))).toBe('07.03.2026');
  });

  it.each([
    { stored: [], valid: true },
    { stored: [{ moves: 10, at: 1 }], valid: true },
    { stored: [{ moves: '10', at: 1 }], valid: false },
    { stored: [{ moves: 10 }], valid: false },
    { stored: [null], valid: false },
    { stored: { moves: 10, at: 1 }, valid: false },
    { stored: null, valid: false },
  ])('takes $stored back from storage: $valid', ({ stored, valid }) => {
    expect(isMemoryResults(stored)).toBe(valid);
  });
});
