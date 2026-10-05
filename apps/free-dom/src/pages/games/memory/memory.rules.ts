/** A game of memory: the deck as laid out, the cards turned up and not yet matched, the faces found. */
export interface MemoryGame<Face extends string = string> {
  readonly deck: readonly Face[];
  /** Places of the cards turned up in this move: none, one, or a wrong pair waiting to turn back. */
  readonly open: readonly number[];
  readonly found: readonly Face[];
  /** One per pair of cards turned up, whether they match or not. */
  readonly moves: number;
}

/** How a card lies. */
export type CardSide = 'down' | 'up' | 'found';

/** A random number in [0, 1), as `Math.random` gives it. */
export type RandomSource = () => number;

/** Fisher–Yates: every order is equally likely. */
const shuffled = <Face extends string>(items: readonly Face[], random: RandomSource): Face[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const [last, picked] = [result[i], result[j]];
    if (last !== undefined && picked !== undefined) {
      result[i] = picked;
      result[j] = last;
    }
  }
  return result;
};

/** Picks `pairs` of the faces and lays each out twice, face down. */
export const dealGame = <Face extends string>(
  faces: readonly Face[],
  pairs: number,
  random: RandomSource = Math.random
): MemoryGame<Face> => {
  const picked = shuffled(faces, random).slice(0, pairs);
  return { deck: shuffled([...picked, ...picked], random), open: [], found: [], moves: 0 };
};

export const cardAt = (game: MemoryGame, place: number): CardSide => {
  const face = game.deck[place];
  if (face !== undefined && game.found.includes(face)) {
    return 'found';
  }
  return game.open.includes(place) ? 'up' : 'down';
};

/** A wrong pair is up: no card turns until it turns back. */
export const isLocked = (game: MemoryGame): boolean => game.open.length === 2;

export const isWon = (game: MemoryGame): boolean => game.deck.length > 0 && game.found.length * 2 === game.deck.length;

/** Turns the card at `place` up; a card that cannot turn leaves the same game, so a repeated click counts nothing. */
export const turnCard = <Face extends string>(game: MemoryGame<Face>, place: number): MemoryGame<Face> => {
  if (isLocked(game) || place < 0 || place >= game.deck.length || cardAt(game, place) !== 'down') {
    return game;
  }
  const [first] = game.open;
  if (first === undefined) {
    return { ...game, open: [place] };
  }
  const face = game.deck[place];
  const moves = game.moves + 1;
  return face !== undefined && game.deck[first] === face
    ? { ...game, open: [], found: [...game.found, face], moves }
    : { ...game, open: [first, place], moves };
};

/** Turns a wrong pair back down. */
export const turnBack = <Face extends string>(game: MemoryGame<Face>): MemoryGame<Face> =>
  isLocked(game) ? { ...game, open: [] } : game;
