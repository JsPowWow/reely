import { DiamondLog } from './demos/diamond.log';
import diamondLogSource from './demos/diamond.log.tsx?highlight';
import { dmlExamples } from './demos/dml.examples';
// eslint-disable-next-line @nx/enforce-module-boundaries -- shown as a listing, never run: labs stay unbuilt
import diamondSpecSource from '../../../../../labs-ignore/signals-graph/diamond.spec.ts?highlight';
import { SourceView } from '../../demo/source.view';
import { Live } from '../docs/docs.live';

import type { DmlExamples } from './demos/dml.examples';

/** The demos and listings the labs place between their paragraphs. */
export interface LabExamples extends DmlExamples {
  diamondSpec: Node;
  diamondLog: Node;
}

export const labExamples = (): LabExamples => ({
  ...dmlExamples(),
  diamondSpec: <SourceView source={diamondSpecSource} caption='labs-ignore/signals-graph/diamond.spec.ts' />,
  diamondLog: <Live Demo={DiamondLog} caption='diamond.log.tsx' source={diamondLogSource} />,
});
