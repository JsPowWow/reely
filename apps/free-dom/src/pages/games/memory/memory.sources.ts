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

/** Their files and highlighted sources, a chunk the game does not wait for. */
export const memoryListings: Record<
  MemoryModule,
  { file: string; source: SourceLines }
> = {
  machine: { file: 'memory.machine.ts', source: withoutRegions(machineSource) },
  game: { file: 'memory.game.tsx', source: sourceOf('memory.game.tsx') },
  leaderboard: {
    file: 'memory.leaderboard.ts',
    source: sourceOf('memory.leaderboard.ts'),
  },
  rules: { file: 'memory.rules.ts', source: sourceOf('memory.rules.ts') },
  moments: {
    file: 'memory.moments.tsx',
    source: sourceOf('memory.moments.tsx'),
  },
  modal: { file: 'modal.tsx', source: sourceOf('modal.tsx') },
};

/** Figures of the game's code: its `if` statements, its lines, its modules. */
export interface MemoryFacts {
  readonly ifs: number;
  readonly lines: number;
  readonly modules: number;
}

const lines = Object.values(highlighted).flatMap((source) =>
  source.map(lineText)
);

/**
 * Counted from the sources, not typed by hand: the code on the page is the
 * code that runs.
 */
export const memoryFacts: MemoryFacts = {
  ifs: lines.filter((line) => /\bif\s*\(/.test(line)).length,
  lines: lines.filter((line) => line.trim() !== '').length,
  modules: Object.keys(highlighted).length,
};
