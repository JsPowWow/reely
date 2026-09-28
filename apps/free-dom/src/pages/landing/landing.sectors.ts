import { Race } from './sectors/lists.race';
import raceSource from './sectors/lists.race.tsx?highlight';
import { Grid } from './sectors/markup.grid';
import gridSource from './sectors/markup.grid.tsx?highlight';
import { Laps } from './sectors/signals.laps';
import lapsSource from './sectors/signals.laps.tsx?highlight';
import { PitWall } from '../docs/demos/pit.stop';
import pitStopSource from '../docs/demos/pit.stop.tsx?highlight';

import type { SourceLines } from '../../highlight/source.types';

/** One sector of the lap: a claim, its split, and the live module that proves it. */
export interface LapSector {
  id: string;
  name: string;
  claim: string;
  /** What the board under the demo shows, in a few words. */
  split: string;
  /** The split, shorter: posted on the sector bar once the sector is driven. */
  mark: string;
  /** The module's file, as the source caption names it. */
  file: string;
  Demo: () => Node;
  source: SourceLines;
}

export const lapSectors: readonly LapSector[] = [
  {
    id: 'markup',
    name: 'Markup',
    claim:
      'Tag factories and JSX return real elements. A component is a function that runs once: the grid was built when the page loaded, and the board under it has counted no writes since.',
    split: '0 writes after render',
    mark: '0 writes',
    file: 'markup.grid.tsx',
    Demo: Grid,
    source: gridSource,
  },
  {
    id: 'signals',
    name: 'Signals',
    claim:
      'A signal in the markup is bound to the one text node that shows it. Complete a lap: the count and the note are edited in place, and the button is disabled only when the flag falls.',
    split: '2 text edits a lap',
    mark: '2 edits',
    file: 'signals.laps.tsx',
    Demo: Laps,
    source: lapsSource,
  },
  {
    id: 'lists',
    name: 'Lists',
    claim:
      'For keeps one row per car. On lap 1 two of the five cars change places: the board counts 4 node writes, a removal and an insertion for each moved row, and a text edit for every place and distance that changed.',
    split: '2 rows moved',
    mark: '2 moved',
    file: 'lists.race.tsx',
    Demo: Race,
    source: raceSource,
  },
  {
    id: 'async',
    name: 'Async',
    claim:
      'Await shows the fallback while a promise is pending, then its result or its error, and only the latest promise renders: box twice and the first stop never posts. Every stop after the first swaps one node for another, twice.',
    split: '4 nodes a stop',
    mark: '4 nodes',
    file: 'pit.stop.tsx',
    Demo: PitWall,
    source: pitStopSource,
  },
];
