import { cardAt, dealGame, isLocked, isWon, turnBack, turnCard } from './memory.rules';

import type { MemoryGame } from './memory.rules';

// a random source that always picks the last remaining item: the shuffle keeps the order
const keepOrder = (): number => 0.999;

const game = (deck: readonly string[]): MemoryGame => ({ deck, open: [], found: [], moves: 0 });

describe('memory rules', () => {
  it('deals every face twice, face down, with no moves', () => {
    const dealt = dealGame(['signals', 'dommy', 'router'], 2, keepOrder);

    expect(dealt.deck).toEqual(['signals', 'dommy', 'signals', 'dommy']);
    expect(dealt.deck.map((_face, index) => cardAt(dealt, index))).toEqual(['down', 'down', 'down', 'down']);
    expect(dealt.moves).toBe(0);
  });

  it('picks its faces and lays out the deck with the random source it is given', () => {
    // Fisher–Yates from the end: 0 swaps each item with the first one
    const dealt = dealGame(['a', 'b', 'c'], 2, () => 0);

    expect(dealt.deck).toEqual(['c', 'b', 'c', 'b']);
  });

  it('counts a move when the second card of a pair is turned, and keeps a found pair open', () => {
    const one = turnCard(game(['a', 'b', 'a', 'b']), 0);
    const two = turnCard(one, 2);

    expect(one.moves).toBe(0);
    expect(cardAt(one, 0)).toBe('up');
    expect(two.moves).toBe(1);
    expect([cardAt(two, 0), cardAt(two, 2), cardAt(two, 1)]).toEqual(['found', 'found', 'down']);
    expect(isLocked(two)).toBe(false);
  });

  it('holds a wrong pair open and ignores every card until it is turned back', () => {
    const wrong = turnCard(turnCard(game(['a', 'b', 'a', 'b']), 0), 1);

    expect(wrong.moves).toBe(1);
    expect(isLocked(wrong)).toBe(true);
    expect(turnCard(wrong, 2)).toBe(wrong);

    const back = turnBack(wrong);
    expect([cardAt(back, 0), cardAt(back, 1)]).toEqual(['down', 'down']);
    expect(back.moves).toBe(1);
  });

  it('ignores a second click on an open card and a click on a found one', () => {
    const one = turnCard(game(['a', 'b', 'a', 'b']), 0);
    const found = turnCard(one, 2);

    expect(turnCard(one, 0)).toBe(one);
    expect(turnCard(found, 2)).toBe(found);
    expect(turnCard(one, 9)).toBe(one);
  });

  it('is won when every pair is found', () => {
    const half = turnCard(turnCard(game(['a', 'b', 'a', 'b']), 0), 2);
    const all = turnCard(turnCard(half, 1), 3);

    expect(isWon(half)).toBe(false);
    expect(isWon(all)).toBe(true);
    expect(all.moves).toBe(2);
  });
});
