import { hasSome } from '@reely/basics';
import { isNonEmpty, Maybe } from '@reely/utils';

/**
 * The table of a game of memory: the deck as laid out, the cards turned up and
 * not yet matched, the faces found.
 */
// #region state
export interface MemoryTable<Face extends string = string> {
  readonly deck: readonly Face[];
  /**
   * Places of the cards turned up in this move: none, one, or a wrong pair
   * waiting to turn back.
   */
  readonly open: readonly [] | readonly [number] | readonly [number, number];
  readonly found: readonly Face[];
  /** One per pair of cards turned up, whether they match or not. */
  readonly moves: number;
}
// #endregion

export type CardSide = 'down' | 'up' | 'found';

/** A random number in [0, 1), as `Math.random` gives it. */
export type RandomSource = () => number;

// #region shuffle
// Fisher and Yates' own method: each card is drawn from those still left, so
// every order is equally likely
const shuffled = <Face extends string>(
  items: readonly Face[],
  random: RandomSource
): Face[] => {
  const left = [...items];
  return items.flatMap(() =>
    left.splice(Math.floor(random() * left.length), 1)
  );
};
// #endregion

/** Picks `pairs` of the faces and lays each out twice, face down. */
export const dealTable = <Face extends string>(
  faces: readonly Face[],
  pairs: number,
  random: RandomSource = Math.random
): MemoryTable<Face> => {
  const picked = shuffled(faces, random).slice(0, pairs);
  return {
    deck: shuffled([...picked, ...picked], random),
    open: [],
    found: [],
    moves: 0,
  };
};

const isFound = (table: MemoryTable, place: number): boolean =>
  table.found.some((face) => face === table.deck[place]);

const upOrDown = (table: MemoryTable, place: number): CardSide =>
  table.open.some((up) => up === place) ? 'up' : 'down';

export const cardAt = (table: MemoryTable, place: number): CardSide =>
  isFound(table, place) ? 'found' : upOrDown(table, place);

/** A wrong pair is up: no card turns until it turns back. */
export const isLocked = (table: MemoryTable): boolean =>
  table.open.length === 2;

export const isWon = (table: MemoryTable): boolean =>
  isNonEmpty(table.deck) && table.found.length * 2 === table.deck.length;

// #region turn-card
/** A card turns when it lies there face down and no wrong pair is waiting. */
export const canTurn = (table: MemoryTable, place: number): boolean =>
  !isLocked(table) &&
  hasSome(table.deck[place]) &&
  cardAt(table, place) === 'down';

// the second card of a move: a pair is found, or both wait to turn back
const turnSecond = <Face extends string>(
  table: MemoryTable<Face>,
  first: number,
  place: number
): MemoryTable<Face> => {
  const moves = table.moves + 1;
  const face = table.deck[place];
  return hasSome(face) && table.deck[first] === face
    ? { ...table, open: [], found: [...table.found, face], moves }
    : { ...table, open: [first, place], moves };
};

/**
 * Turns the card at `place` up; a card that cannot turn leaves the same table,
 * so a repeated click counts nothing.
 */
export const turnCard = <Face extends string>(
  table: MemoryTable<Face>,
  place: number
): MemoryTable<Face> =>
  canTurn(table, place)
    ? Maybe.from(table.open[0]).unwrap(
        (first) => turnSecond(table, first, place),
        () => ({ ...table, open: [place] })
      )
    : table;
// #endregion

export const turnBack = <Face extends string>(
  table: MemoryTable<Face>
): MemoryTable<Face> => (isLocked(table) ? { ...table, open: [] } : table);
