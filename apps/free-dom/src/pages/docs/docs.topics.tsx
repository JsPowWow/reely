import { Board as KeyedBoard } from '../evolution/steps/step12.keyed-list';
import keyedListSource from '../evolution/steps/step12.keyed-list.tsx?highlight';
import { Board as LiveBoard } from '../evolution/steps/step13.five-hundred';
import fiveHundredSource from '../evolution/steps/step13.five-hundred.tsx?highlight';
import { ReelyLinks as JsxLinks } from '../evolution/steps/step2.jsx';
import jsxSource from '../evolution/steps/step2.jsx.tsx?highlight';
import { ReelyLinks as ComponentLinks } from '../evolution/steps/step3.components';
import componentsSource from '../evolution/steps/step3.components.tsx?highlight';
import { Tickets as DerivedTickets } from '../evolution/steps/step8.derived';
import derivedSource from '../evolution/steps/step8.derived.ts?highlight';
import { Tickets as GetterTickets } from '../evolution/steps/step9.getter';
import getterSource from '../evolution/steps/step9.getter.ts?highlight';
import { Tickets as BatchTickets } from '../evolution/steps/step11.batch';
import batchSource from '../evolution/steps/step11.batch.ts?highlight';
import { DeliveryCost } from './demos/advanced/delivery.cost';
import deliveryCostSource from './demos/advanced/delivery.cost.tsx?highlight';
import { DeliveryTracker } from './demos/delivery.tracker';
import deliveryTrackerSource from './demos/delivery.tracker.tsx?highlight';
import { ExchangeRate } from './demos/exchange.rate';
import exchangeRateSource from './demos/exchange.rate.tsx?highlight';
import { LikeButton } from './demos/like.button';
import likeButtonSource from './demos/like.button.tsx?highlight';
import { StopwatchSlot } from './demos/stopwatch';
import stopwatchSource from './demos/stopwatch.tsx?highlight';

import type { SourceLines } from '../../highlight/source.types';

/** The groups of the docs rail, in the order the library is layered; their names are in `docs.text`. */
export const docGroups = ['start', 'markup', 'reactivity', 'structure', 'deeper', 'measure'] as const;

export type DocGroup = (typeof docGroups)[number];

/** The docs pages, each answering one question; their words are in `docs.text`. */
export type DocSlug =
  | 'getting-started'
  | 'elements'
  | 'components'
  | 'signals'
  | 'bindings'
  | 'batch'
  | 'lists'
  | 'conditions'
  | 'async'
  | 'lifecycle'
  | 'advanced'
  | 'performance';

/** One docs page: one question, its answer running with DOM writes counted, then the details. */
export interface DocTopic {
  slug: DocSlug;
  group: DocGroup;
  Demo: () => Node;
  /** The module that renders the demo, highlighted at build time. */
  source: SourceLines;
}

export const docTopics: readonly DocTopic[] = [
  { slug: 'getting-started', group: 'start', Demo: LikeButton, source: likeButtonSource },
  { slug: 'elements', group: 'markup', Demo: JsxLinks, source: jsxSource },
  { slug: 'components', group: 'markup', Demo: ComponentLinks, source: componentsSource },
  { slug: 'signals', group: 'reactivity', Demo: DerivedTickets, source: derivedSource },
  { slug: 'bindings', group: 'reactivity', Demo: GetterTickets, source: getterSource },
  { slug: 'batch', group: 'reactivity', Demo: BatchTickets, source: batchSource },
  { slug: 'lists', group: 'structure', Demo: KeyedBoard, source: keyedListSource },
  { slug: 'conditions', group: 'structure', Demo: DeliveryTracker, source: deliveryTrackerSource },
  { slug: 'async', group: 'structure', Demo: ExchangeRate, source: exchangeRateSource },
  { slug: 'lifecycle', group: 'structure', Demo: StopwatchSlot, source: stopwatchSource },
  { slug: 'advanced', group: 'deeper', Demo: DeliveryCost, source: deliveryCostSource },
  { slug: 'performance', group: 'measure', Demo: LiveBoard, source: fiveHundredSource },
];
