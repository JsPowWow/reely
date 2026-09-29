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
    id: 'signals',
    title: 'One keystroke, two text edits',
    claim:
      'Type in the field. The greeting and the letter count are the two text nodes bound to the name, so each keystroke edits those two, and the board counts nothing else.',
    file: 'live.preview.tsx',
    Demo: LivePreview,
    source: previewSource,
  },
  {
    id: 'elements',
    title: 'The element itself',
    claim:
      'A tag factory returns the real HTMLButtonElement, typed as one, so shake.animate() needs no ref, and the animation writes nothing to the DOM.',
    file: 'real.element.ts',
    Demo: ShakeButton,
    source: elementSource,
  },
  {
    id: 'lists',
    title: 'Rows move, they are not rebuilt',
    claim:
      'Type a note in any row, then reverse the list: the board counts moved nodes and no new ones, and your note moves with its row.',
    file: 'keyed.notes.tsx',
    Demo: KeyedNotes,
    source: notesSource,
  },
  {
    id: 'async',
    title: 'Only the latest answer',
    claim:
      'Type eff quickly. This server answers shorter queries later, as a slow network would; Await shows the answer to the latest query and drops the late ones, counted under the results.',
    file: 'api.search.tsx',
    Demo: ApiSearch,
    source: searchSource,
  },
];
