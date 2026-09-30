import { SourceView } from '../../demo/source.view';
import { Live } from '../docs/docs.live';
import diamondSpecSource from '../../../../../labs-ignore/signals-graph/diamond.spec.ts?highlight';
import { DiamondLog } from './demos/diamond.log';
import diamondLogSource from './demos/diamond.log.tsx?highlight';
import { MarkupList } from './demos/markup.list';
import markupListSource from './demos/markup.list.tsx?highlight';
import { SharedParent } from './demos/shared.parent';
import sharedParentSource from './demos/shared.parent.tsx?highlight';

/** The demos and listings the labs place between their paragraphs. */
export interface LabExamples {
  markupList: Node;
  sharedParent: Node;
  diamondSpec: Node;
  diamondLog: Node;
}

export const labExamples = (): LabExamples => ({
  markupList: <Live Demo={MarkupList} caption='markup.list.tsx' source={markupListSource} />,
  sharedParent: <Live Demo={SharedParent} caption='shared.parent.tsx' source={sharedParentSource} />,
  diamondSpec: <SourceView source={diamondSpecSource} caption='labs-ignore/signals-graph/diamond.spec.ts' />,
  diamondLog: <Live Demo={DiamondLog} caption='diamond.log.tsx' source={diamondLogSource} />,
});
