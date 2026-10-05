import styles from './memory.module.css?highlight';
import { sourceRegion } from '../../../highlight/source.regions';

import type { SourceLines } from '../../../highlight/source.types';

// every module of the game, highlighted at build time
const sources: Readonly<Record<string, SourceLines>> = {
  ...import.meta.glob<SourceLines>(['./*.{ts,tsx}', '!./*.spec.{ts,tsx}'], {
    query: '?highlight',
    import: 'default',
    eager: true,
  }),
  './memory.module.css': styles,
};

/** A module of the game by its file name, highlighted; nothing for another. */
export const sourceOf = (file: string): SourceLines =>
  sources[`./${file}`] ?? [];

/** The lines a region of a module's source marks, as the story quotes them. */
export const snippet = (file: string, region: string): SourceLines =>
  sourceRegion(sourceOf(file), region);
