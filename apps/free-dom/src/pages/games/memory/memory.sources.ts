import styles from './memory.module.css?highlight';
// a glob never matches the module that runs it
import itself from './memory.sources.ts?highlight';
import { lineText, sourceRegion } from '../../../highlight/source.regions';

import type { SourceLines } from '../../../highlight/source.types';

// #region count
// every module of the game, highlighted at build time; a new module joins
// the count on its own
const highlighted = import.meta.glob<SourceLines>(
  ['./*.{ts,tsx}', '!./*.spec.{ts,tsx}'],
  { query: '?highlight', import: 'default', eager: true }
);

// what a comment says is not code
const code = Object.values(highlighted).flatMap((source) =>
  source.map((line) => lineText(line).split('//')[0] ?? '')
);

/** The `if` and `switch` statements in every module of the game. */
export const memoryBranches = code.filter((line) =>
  /\b(if|switch)\s*\(/.test(line)
).length;
// #endregion

const sources: Readonly<Record<string, SourceLines>> = {
  ...highlighted,
  './memory.module.css': styles,
  './memory.sources.ts': itself,
};

/** A module of the game by its file name, highlighted; nothing for another. */
export const sourceOf = (file: string): SourceLines =>
  sources[`./${file}`] ?? [];

/** The lines a region of a module's source marks, as the story quotes them. */
export const snippet = (file: string, region: string): SourceLines =>
  sourceRegion(sourceOf(file), region);
