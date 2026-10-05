import { hasProperty, isNumber } from '@reely/utils';

/** One win: how many moves it took, and when it ended (ms since the epoch). */
export interface MemoryResult {
  readonly moves: number;
  readonly at: number;
}

export const leaderboardSize = 10;

const byRank = (one: MemoryResult, other: MemoryResult): number =>
  one.moves - other.moves || one.at - other.at;

const isOther =
  (result: MemoryResult) =>
  (other: MemoryResult): boolean =>
    other.moves !== result.moves || other.at !== result.at;

/** The best ten with a win posted, and its place (from 1) when it made them. */
export interface Posted {
  readonly board: readonly MemoryResult[];
  readonly place: number | undefined;
}

// #region rank
/** The board with `result` posted, kept to the best ten, and its place. */
export const postResult = (
  board: readonly MemoryResult[],
  result: MemoryResult
): Posted => {
  const ranked = [...board.filter(isOther(result)), result]
    .sort(byRank)
    .slice(0, leaderboardSize);
  return {
    board: ranked,
    place: ranked.includes(result) ? ranked.indexOf(result) + 1 : undefined,
  };
};
// #endregion

// a German day is written DD.MM.YYYY, as the leaderboard wants it
const dayFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** The day of `at` in the reader's time zone, as DD.MM.YYYY. */
export const formatDay = (at: number): string => dayFormat.format(at);

const isMemoryResult = (maybeResult: unknown): maybeResult is MemoryResult =>
  hasProperty('moves', maybeResult) &&
  hasProperty('at', maybeResult) &&
  isNumber(maybeResult.moves) &&
  isNumber(maybeResult.at);

/** What storage gave back is a board of wins: anything else is dropped. */
export const isBoard = (
  maybeBoard: unknown
): maybeBoard is readonly MemoryResult[] =>
  Array.isArray(maybeBoard) && maybeBoard.every(isMemoryResult);
