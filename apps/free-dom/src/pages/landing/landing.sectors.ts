import { Race } from './sectors/lists.race';
import raceSource from './sectors/lists.race.tsx?highlight';
import { Grid } from './sectors/markup.grid';
import gridSource from './sectors/markup.grid.tsx?highlight';
import { Laps } from './sectors/signals.laps';
import lapsSource from './sectors/signals.laps.tsx?highlight';

import type { SourceLines } from '../../highlight/source.types';

/** One sector of the lap: a claim, its split, and the live module that proves it. */
export interface LapSector {
  id: string;
  name: string;
  claim: string;
  split: string;
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
    file: 'grid.tsx',
    Demo: Grid,
    source: gridSource,
  },
  {
    id: 'signals',
    name: 'Signals',
    claim:
      'A signal in the markup is bound to the one text node that shows it. Complete a lap: the count and the note are edited in place, and the button is disabled only when the flag falls.',
    split: '2 text edits a lap',
    file: 'laps.tsx',
    Demo: Laps,
    source: lapsSource,
  },
  {
    id: 'lists',
    name: 'Lists',
    claim:
      'For keeps one row per car. Race a lap: the rows that changed places move, the others stay where they are, and every new distance is one text edit.',
    split: 'Only moved rows move',
    file: 'race.tsx',
    Demo: Race,
    source: raceSource,
  },
];
