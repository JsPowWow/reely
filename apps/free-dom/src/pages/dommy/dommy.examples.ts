import { ApiSearch } from './examples/api.search';
import searchSource from './examples/api.search.tsx?highlight';
import { KeyedNotes } from './examples/keyed.notes';
import notesSource from './examples/keyed.notes.tsx?highlight';
import { LivePreview } from './examples/live.preview';
import previewSource from './examples/live.preview.tsx?highlight';
import { AddToCart } from './examples/real.element';
import elementSource from './examples/real.element.ts?highlight';

import type { SourceLines } from '../../highlight/source.types';

/** The examples on the dommy page, in the order they are shown; their words are in `dommy.text`. */
export type DommyExampleId = 'signals' | 'elements' | 'lists' | 'async';

/** One example on the dommy page: the live module that proves its claim. */
export interface DommyExample {
  id: DommyExampleId;
  /** The module's file, as the source caption names it. */
  file: string;
  Demo: () => Node;
  source: SourceLines;
}

export const dommyExamples: readonly DommyExample[] = [
  {
    id: 'signals',
    file: 'live.preview.tsx',
    Demo: LivePreview,
    source: previewSource,
  },
  {
    id: 'elements',
    file: 'real.element.ts',
    Demo: AddToCart,
    source: elementSource,
  },
  {
    id: 'lists',
    file: 'keyed.notes.tsx',
    Demo: KeyedNotes,
    source: notesSource,
  },
  {
    id: 'async',
    file: 'api.search.tsx',
    Demo: ApiSearch,
    source: searchSource,
  },
];
