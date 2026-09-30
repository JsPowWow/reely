import { ReelyLinks as FactoryLinks } from './steps/step1.factories';
import factoriesSource from './steps/step1.factories.ts?highlight';
import { Tickets as TwoSignalTickets } from './steps/step10.two-signals';
import twoSignalsSource from './steps/step10.two-signals.ts?highlight';
import { Tickets as BatchTickets } from './steps/step11.batch';
import batchSource from './steps/step11.batch.ts?highlight';
import { Board as KeyedBoard } from './steps/step12.keyed-list';
import keyedListSource from './steps/step12.keyed-list.tsx?highlight';
import { Board as LiveBoard } from './steps/step13.five-hundred';
import fiveHundredSource from './steps/step13.five-hundred.tsx?highlight';
import { ReelyLinks as JsxLinks } from './steps/step2.jsx';
import jsxSource from './steps/step2.jsx.tsx?highlight';
import { ReelyLinks as ComponentLinks } from './steps/step3.components';
import componentsSource from './steps/step3.components.tsx?highlight';
import { Tickets as DomTickets } from './steps/step4.dom';
import domSource from './steps/step4.dom.ts?highlight';
import { Tickets as SignalTickets } from './steps/step5.signal';
import signalSource from './steps/step5.signal.ts?highlight';
import { Tickets as HandBoundTickets } from './steps/step6.bind-by-hand';
import handBindSource from './steps/step6.bind-by-hand.ts?highlight';
import { Tickets as BoundTickets } from './steps/step7.bind';
import bindSource from './steps/step7.bind.ts?highlight';
import { Tickets as DerivedTickets } from './steps/step8.derived';
import derivedSource from './steps/step8.derived.ts?highlight';
import { Tickets as GetterTickets } from './steps/step9.getter';
import getterSource from './steps/step9.getter.ts?highlight';

import type { SourceLines } from '../../highlight/source.types';

/** The steps of reely evolution, in order; their words are in `evolution.text`. */
export type StepSlug =
  | 'factories'
  | 'jsx'
  | 'components'
  | 'dom'
  | 'signal'
  | 'bind-by-hand'
  | 'bind'
  | 'derived'
  | 'getter'
  | 'two-signals'
  | 'batch'
  | 'keyed-list'
  | 'five-hundred';

/** One step of reely evolution; each track adds one reely feature at a time to the same demo. */
export interface EvolutionStep {
  slug: StepSlug;
  /** Steps that build the same demo share a track; a step's source is diffed against the previous step on its track. */
  track: 'links' | 'tickets' | 'board';
  Demo: () => Node;
  /** The module that renders the demo, highlighted at build time. */
  source: SourceLines;
}

export const evolutionSteps: readonly EvolutionStep[] = [
  { slug: 'factories', track: 'links', Demo: FactoryLinks, source: factoriesSource },
  { slug: 'jsx', track: 'links', Demo: JsxLinks, source: jsxSource },
  { slug: 'components', track: 'links', Demo: ComponentLinks, source: componentsSource },
  { slug: 'dom', track: 'tickets', Demo: DomTickets, source: domSource },
  { slug: 'signal', track: 'tickets', Demo: SignalTickets, source: signalSource },
  { slug: 'bind-by-hand', track: 'tickets', Demo: HandBoundTickets, source: handBindSource },
  { slug: 'bind', track: 'tickets', Demo: BoundTickets, source: bindSource },
  { slug: 'derived', track: 'tickets', Demo: DerivedTickets, source: derivedSource },
  { slug: 'getter', track: 'tickets', Demo: GetterTickets, source: getterSource },
  { slug: 'two-signals', track: 'tickets', Demo: TwoSignalTickets, source: twoSignalsSource },
  { slug: 'batch', track: 'tickets', Demo: BatchTickets, source: batchSource },
  { slug: 'keyed-list', track: 'board', Demo: KeyedBoard, source: keyedListSource },
  { slug: 'five-hundred', track: 'board', Demo: LiveBoard, source: fiveHundredSource },
];
