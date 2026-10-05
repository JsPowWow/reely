import { ObjectStore } from '@reely/simple-store';
import { Either, hasProperty, isNumber } from '@reely/utils';

/** One win: how many moves it took, and when it ended (ms since the epoch). */
export interface MemoryResult {
  readonly moves: number;
  readonly at: number;
}

export const leaderboardSize = 10;

const byRank = (one: MemoryResult, other: MemoryResult): number =>
  one.moves - other.moves || one.at - other.at;

const isSameResult =
  (result: MemoryResult) =>
  (other: MemoryResult): boolean =>
    other.moves === result.moves && other.at === result.at;

/**
 * The best ten, and the place (from 1) of the last win posted, when it made the
 * board.
 */
export interface Leaderboard {
  readonly board: readonly MemoryResult[];
  readonly place: number | undefined;
}

/** The board with `result` posted, kept to the best ten, and its place. */
export const postResult = (
  board: readonly MemoryResult[],
  result: MemoryResult
): Leaderboard => {
  const posted = board.some(isSameResult(result))
    ? [...board]
    : [...board, result];
  const ranked = posted.sort(byRank).slice(0, leaderboardSize);
  const index = ranked.findIndex(isSameResult(result));
  return { board: ranked, place: index === -1 ? undefined : index + 1 };
};

const twoDigits = (value: number): string => String(value).padStart(2, '0');

/** The day of `at` in the reader's time zone, as DD.MM.YYYY. */
export const formatDay = (at: number): string => {
  const date = new Date(at);
  return `${twoDigits(date.getDate())}.${twoDigits(
    date.getMonth() + 1
  )}.${date.getFullYear()}`;
};

const isMemoryResult = (maybeResult: unknown): maybeResult is MemoryResult =>
  hasProperty('moves', maybeResult) &&
  hasProperty('at', maybeResult) &&
  isNumber(maybeResult.moves) &&
  isNumber(maybeResult.at);

/**
 * What storage gave back is a leaderboard: anything else, edited by hand or
 * from an older build, is dropped.
 */
export const isMemoryResults = (
  maybeResults: unknown
): maybeResults is MemoryResult[] =>
  Array.isArray(maybeResults) && maybeResults.every(isMemoryResult);

const storageKey = 'reely.memory.leaderboard';

const load = (storage: Pick<Storage, 'getItem'>): MemoryResult[] =>
  Either.tryCatch((): unknown =>
    JSON.parse(storage.getItem(storageKey) ?? '[]')
  )
    .map((stored) => (isMemoryResults(stored) ? stored : []))
    .getOrElse([]);

/**
 * The leaderboard as a store, read from `storage` and written back on every
 * change of its board. A storage that is missing or throws (a private window, a
 * full quota) leaves it working for this page only.
 */
export const createLeaderboard = (
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): ObjectStore<Leaderboard> => {
  const leaderboard = new ObjectStore<Leaderboard>({
    board: storage ? load(storage) : [],
    place: undefined,
  });
  leaderboard
    .select(({ board }) => board)
    .on('changed', (board) =>
      Either.tryCatch(() => storage?.setItem(storageKey, JSON.stringify(board)))
    );
  return leaderboard;
};
