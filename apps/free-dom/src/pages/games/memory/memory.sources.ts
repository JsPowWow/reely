import { lineText, withoutRegions } from '../../../highlight/source.regions';

import type { SourceLines } from '../../../highlight/source.types';

// every module of the game, highlighted at build time; a new module joins
// the count on its own
const highlighted = import.meta.glob<SourceLines>(
  ['./*.{ts,tsx}', '!./*.spec.{ts,tsx}'],
  { query: '?highlight', import: 'default', eager: true }
);

const sourceOf = (file: string): SourceLines => highlighted[`./${file}`] ?? [];

/** The modules the page lists under the game, in reading order. */
export type MemoryModule =
  | 'machine'
  | 'game'
  | 'leaderboard'
  | 'rules'
  | 'moments'
  | 'modal';

export const machineSource = sourceOf('memory.machine.ts');

const listing = (file: string): { file: string; source: SourceLines } => ({
  file,
  source: sourceOf(file),
});

/** Their files and highlighted sources, a chunk the game does not wait for. */
export const memoryListings: Record<
  MemoryModule,
  { file: string; source: SourceLines }
> = {
  machine: { file: 'memory.machine.ts', source: withoutRegions(machineSource) },
  game: listing('memory.game.tsx'),
  leaderboard: listing('memory.leaderboard.ts'),
  rules: listing('memory.rules.ts'),
  moments: listing('memory.moments.tsx'),
  modal: listing('modal.tsx'),
};

// what a comment says is not code
const code = Object.values(highlighted).flatMap((source) =>
  source.map((line) => lineText(line).split('//')[0] ?? '')
);

/**
 * The `if` and `switch` statements in every module of the game, counted from
 * the sources, not typed by hand: the code on the page is the code that runs.
 */
export const memoryBranches = code.filter((line) =>
  /\b(if|switch)\s*\(/.test(line)
).length;
