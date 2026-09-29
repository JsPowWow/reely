import { ApiSearch } from './examples/api.search';
import searchSource from './examples/api.search.tsx?highlight';
import { KeyedNotes } from './examples/keyed.notes';
import notesSource from './examples/keyed.notes.tsx?highlight';
import { LivePreview } from './examples/live.preview';
import previewSource from './examples/live.preview.tsx?highlight';
import { ShakeButton } from './examples/real.element';
import elementSource from './examples/real.element.ts?highlight';

import type { SourceLines } from '../../highlight/source.types';

/** One example on the landing page: what it proves, and the live module that proves it. */
export interface LandingExample {
  id: string;
  title: string;
  claim: string;
  /** The module's file, as the source caption names it. */
  file: string;
  Demo: () => Node;
  source: SourceLines;
}

export const landingExamples: readonly LandingExample[] = [
  {
    id: 'elements',
    title: 'The element itself',
    claim:
      'A tag factory returns a real HTMLButtonElement, typed as one, so the DOM API is right there: shake.animate() needs no ref and no wrapper. The animation runs on the element, and the board under it counts no writes.',
    file: 'real.element.ts',
    Demo: ShakeButton,
    source: elementSource,
  },
  {
    id: 'signals',
    title: 'One keystroke, two text edits',
    claim:
      'Type your name. The greeting and the count are the two text nodes bound to the signal, so each keystroke edits those two and nothing else: no re-render, no diff.',
    file: 'live.preview.tsx',
    Demo: LivePreview,
    source: previewSource,
  },
  {
    id: 'lists',
    title: 'Rows move, they are not rebuilt',
    claim:
      'Type a note in any row, then reverse the list. For keeps one row per key and moves its nodes, so your note, and the input it lives in, move with the row.',
    file: 'keyed.notes.tsx',
    Demo: KeyedNotes,
    source: notesSource,
  },
  {
    id: 'async',
    title: 'Only the latest answer',
    claim:
      'Type e, ef, eff quickly. The server here answers shorter queries later, the way a slow network would; Await shows the answer for the latest query and drops the late ones.',
    file: 'api.search.tsx',
    Demo: ApiSearch,
    source: searchSource,
  },
];
