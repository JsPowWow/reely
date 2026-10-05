import { Maybe } from '@reely/utils';

/**
 * A game of memory: the deck as laid out, the cards turned up and not yet
 * matched, the faces found.
 */
export interface MemoryState<Face extends string = string> {
  readonly deck: readonly Face[];
  /**
   * Places of the cards turned up in this move: none, one, or a wrong pair
   * waiting to turn back.
   */
  readonly open: readonly number[];
  readonly found: readonly Face[];
  /** One per pair of cards turned up, whether they match or not. */
  readonly moves: number;
}

export type CardSide = 'down' | 'up' | 'found';

/** A random number in [0, 1), as `Math.random` gives it. */
export type RandomSource = () => number;

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

/** Picks `pairs` of the faces and lays each out twice, face down. */
export const dealGame = <Face extends string>(
  faces: readonly Face[],
  pairs: number,
  random: RandomSource = Math.random
): MemoryState<Face> => {
  const picked = shuffled(faces, random).slice(0, pairs);
  return {
    deck: shuffled([...picked, ...picked], random),
    open: [],
    found: [],
    moves: 0,
  };
};

const isFound = (game: MemoryState, place: number): boolean =>
  game.found.some((face) => face === game.deck[place]);

const upOrDown = (game: MemoryState, place: number): CardSide =>
  game.open.includes(place) ? 'up' : 'down';

export const cardAt = (game: MemoryState, place: number): CardSide =>
  isFound(game, place) ? 'found' : upOrDown(game, place);

/** A wrong pair is up: no card turns until it turns back. */
export const isLocked = (game: MemoryState): boolean => game.open.length === 2;

export const isWon = (game: MemoryState): boolean =>
  game.deck.length > 0 && game.found.length * 2 === game.deck.length;

/** A card turns when it lies face down and no wrong pair is waiting. */
export const canTurn = (game: MemoryState, place: number): boolean =>
  !isLocked(game) &&
  place >= 0 &&
  place < game.deck.length &&
  cardAt(game, place) === 'down';

// the second card of a move: a pair is found, or both wait to turn back
const turnSecond = <Face extends string>(
  game: MemoryState<Face>,
  first: number,
  place: number
): MemoryState<Face> => {
  const moves = game.moves + 1;
  const face = game.deck[place];
  return face !== undefined && game.deck[first] === face
    ? { ...game, open: [], found: [...game.found, face], moves }
    : { ...game, open: [first, place], moves };
};

/**
 * Turns the card at `place` up; a card that cannot turn leaves the same game,
 * so a repeated click counts nothing.
 */
export const turnCard = <Face extends string>(
  game: MemoryState<Face>,
  place: number
): MemoryState<Face> =>
  canTurn(game, place)
    ? Maybe.from(game.open[0]).unwrap(
        (first) => turnSecond(game, first, place),
        () => ({ ...game, open: [place] })
      )
    : game;

export const turnBack = <Face extends string>(
  game: MemoryState<Face>
): MemoryState<Face> => (isLocked(game) ? { ...game, open: [] } : game);
