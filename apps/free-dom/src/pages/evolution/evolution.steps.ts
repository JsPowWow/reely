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

/** One step of reely evolution; each track adds one reely feature at a time to the same demo. */
export interface EvolutionStep {
  slug: string;
  /** Steps that build the same demo share a track; a step's source is diffed against the previous step on its track. */
  track: 'links' | 'tickets' | 'board';
  title: string;
  lead: string;
  Demo: () => Node;
  /** The module that renders the demo, highlighted at build time. */
  source: SourceLines;
}

export const evolutionSteps: readonly EvolutionStep[] = [
  {
    slug: 'factories',
    track: 'links',
    title: 'Markup with tag factories',
    lead: 'Every HTML tag is a function that returns a real DOM element: props first, children after. No template language and no virtual DOM, so what you build is what the browser shows. The board under the demo counts the nodes the card built once; nothing is written to the DOM after that.',
    Demo: FactoryLinks,
    source: factoriesSource,
  },
  {
    slug: 'jsx',
    track: 'links',
    title: 'The same markup in JSX',
    lead: 'JSX reads like HTML and compiles to the same function calls, so the card renders exactly the same nodes. Props are DOM properties, so the class goes in className.',
    Demo: JsxLinks,
    source: jsxSource,
  },
  {
    slug: 'components',
    track: 'links',
    title: 'Components from data',
    lead: 'The three links differ only in their data. A component is a plain function of props, and map turns the data into elements. It runs once: there is no re-render to schedule.',
    Demo: ComponentLinks,
    source: componentsSource,
  },
  {
    slug: 'dom',
    track: 'tickets',
    title: 'Interactivity by hand',
    lead: 'An element keeps its listeners, so a click can change the page. Here it picks concert tickets: the number sits in an output, the HTML element for a result; elementRef hands that element over, and the click handler redraws it by hand. Watch the board under the demo: each click removes one text node and adds another.',
    Demo: DomTickets,
    source: domSource,
  },
  {
    slug: 'signal',
    track: 'tickets',
    title: 'State in a signal',
    lead: 'A signal is a value that knows who reads it. The number moves from a variable into a signal, and an effect that reads tickets.value runs again after every change, so the click handlers only write the signal. The effect still redraws the whole output: the board counts a removed and an added node on every click.',
    Demo: SignalTickets,
    source: signalSource,
  },
  {
    slug: 'bind-by-hand',
    track: 'tickets',
    title: 'Bind by hand',
    lead: 'A function in elementRef is called once with the element it created. Subscribing that element to the signal is a binding by hand: the effect now lives with the output it writes. Setting textContent still swaps the text node, as the board shows; next, dommy keeps one text node and edits it.',
    Demo: HandBoundTickets,
    source: handBindSource,
  },
  {
    slug: 'bind',
    track: 'tickets',
    title: 'Bind the signal',
    lead: 'Pass the signal itself as a child, and dommy does the binding: it creates one text node and edits its text on every change. A click now changes that text and nothing else: one text edit, no nodes added or removed. This is the whole idea of dommy.',
    Demo: BoundTickets,
    source: bindSource,
  },
  {
    slug: 'derived',
    track: 'tickets',
    title: 'Derived values',
    lead: 'A computed value derives from signals and is bound like one. The ticket plan (empty, single, or a group from two tickets) lands in a data attribute, so the board now counts attribute edits: one for each click that changes the plan.',
    Demo: DerivedTickets,
    source: derivedSource,
  },
  {
    slug: 'getter',
    track: 'tickets',
    title: 'A getter in a prop',
    lead: 'Any function in a prop is bound like a signal, so disabled follows the tickets without a computed. It is written only when its value really changes: once when the cart leaves zero, and again when it comes back.',
    Demo: GetterTickets,
    source: getterSource,
  },
  {
    slug: 'two-signals',
    track: 'tickets',
    title: 'Two signals, the summary written twice',
    lead: 'A ticket in the cart is a seat taken from the hall, so each press changes two signals, and the summary reads both. Updates are synchronous, so the summary is written after the first change and again after the second: three text edits per click.',
    Demo: TwoSignalTickets,
    source: twoSignalsSource,
  },
  {
    slug: 'batch',
    track: 'tickets',
    title: 'Group writes with batch',
    lead: 'batch applies both changes first and runs each binding once when it returns. The summary is written once, so a click costs two text edits instead of three.',
    Demo: BatchTickets,
    source: batchSource,
  },
  {
    slug: 'keyed-list',
    track: 'board',
    title: 'A keyed list',
    lead: 'For renders one row per key, once. Here it ranks a watchlist by today’s change. After a price update the list is in a new order: the rows that kept their key keep their nodes, and only the rows that changed places are moved. The board counts two node writes per moved row, and a text edit for every rank and change that differs.',
    Demo: KeyedBoard,
    source: keyedListSource,
  },
  {
    slug: 'five-hundred',
    track: 'board',
    title: 'Five hundred rows',
    lead: 'The same movers for a whole index of five hundred stocks, timed in your browser: each update is measured from the write to the finished layout, and the median and 95th percentile appear once 20 updates are timed. Then give every row a new key on every update: For throws each row away and builds it again, and the board and the timings show what that costs.',
    Demo: LiveBoard,
    source: fiveHundredSource,
  },
];
