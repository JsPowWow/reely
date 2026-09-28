import { ReelyLinks as FactoryLinks } from './steps/step1.factories';
import factoriesSource from './steps/step1.factories.ts?highlight';
import { Counter as TwoSignalCounter } from './steps/step10.two-signals';
import twoSignalsSource from './steps/step10.two-signals.ts?highlight';
import { Counter as BatchCounter } from './steps/step11.batch';
import batchSource from './steps/step11.batch.ts?highlight';
import { Board as KeyedBoard } from './steps/step12.keyed-list';
import keyedListSource from './steps/step12.keyed-list.tsx?highlight';
import { Board as LiveBoard } from './steps/step13.five-hundred';
import fiveHundredSource from './steps/step13.five-hundred.tsx?highlight';
import { ReelyLinks as JsxLinks } from './steps/step2.jsx';
import jsxSource from './steps/step2.jsx.tsx?highlight';
import { ReelyLinks as ComponentLinks } from './steps/step3.components';
import componentsSource from './steps/step3.components.tsx?highlight';
import { Counter as DomCounter } from './steps/step4.dom';
import domSource from './steps/step4.dom.ts?highlight';
import { Counter as SignalCounter } from './steps/step5.signal';
import signalSource from './steps/step5.signal.ts?highlight';
import { Counter as HandBoundCounter } from './steps/step6.bind-by-hand';
import handBindSource from './steps/step6.bind-by-hand.ts?highlight';
import { Counter as BoundCounter } from './steps/step7.bind';
import bindSource from './steps/step7.bind.ts?highlight';
import { Counter as DerivedCounter } from './steps/step8.derived';
import derivedSource from './steps/step8.derived.ts?highlight';
import { Counter as GetterCounter } from './steps/step9.getter';
import getterSource from './steps/step9.getter.ts?highlight';

import type { SourceLines } from '../../highlight/source.types';

/**
 * One step of reely evolution: the markup steps build the same card three ways, the counter steps
 * add one reely feature at a time, and the board steps race a keyed list.
 */
export interface EvolutionStep {
  slug: string;
  /** Steps that build the same demo share a track; a step's source is diffed against the previous step on its track. */
  track: 'links' | 'counter' | 'board';
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
    track: 'counter',
    title: 'Interactivity by hand',
    lead: 'An element keeps its listeners, so a click can change the page. The number sits in an output, the HTML element for a result; elementRef hands that element over, and the click handler redraws it by hand. Watch the board under the demo: each click removes one text node and adds another.',
    Demo: DomCounter,
    source: domSource,
  },
  {
    slug: 'signal',
    track: 'counter',
    title: 'State in a signal',
    lead: 'A signal is a value that knows who reads it. The number moves from a variable into a signal, and an effect that reads count.value runs again after every change, so the click handlers only write the signal. The effect still redraws the whole output: the board counts a removed and an added node on every click.',
    Demo: SignalCounter,
    source: signalSource,
  },
  {
    slug: 'bind-by-hand',
    track: 'counter',
    title: 'Bind by hand',
    lead: 'A function in elementRef is called once with the element it created. Subscribing that element to the signal is a binding by hand: the effect now lives with the output it writes. Setting textContent still swaps the text node, as the board shows; next, dommy keeps one text node and edits it.',
    Demo: HandBoundCounter,
    source: handBindSource,
  },
  {
    slug: 'bind',
    track: 'counter',
    title: 'Bind the signal',
    lead: 'Pass the signal itself as a child, and dommy does the binding: it creates one text node and edits its text on every change. A click now changes that text and nothing else: one text edit, no nodes added or removed. This is the whole idea of dommy.',
    Demo: BoundCounter,
    source: bindSource,
  },
  {
    slug: 'derived',
    track: 'counter',
    title: 'Derived values',
    lead: 'A computed value derives from signals and is bound like one. The parity lands in a data attribute, so the board now counts attribute edits: one per click, because the parity changes on every click.',
    Demo: DerivedCounter,
    source: derivedSource,
  },
  {
    slug: 'getter',
    track: 'counter',
    title: 'A getter in a prop',
    lead: 'Any function in a prop is bound like a signal, so disabled follows the count without a computed. It is written only when its value really changes: once when the count leaves zero, and again when it comes back.',
    Demo: GetterCounter,
    source: getterSource,
  },
  {
    slug: 'two-signals',
    track: 'counter',
    title: 'Two signals, the summary written twice',
    lead: 'Each press changes two signals, and the summary reads both. Updates are synchronous, so the summary is written after the first change and again after the second: three text edits per click.',
    Demo: TwoSignalCounter,
    source: twoSignalsSource,
  },
  {
    slug: 'batch',
    track: 'counter',
    title: 'Group writes with batch',
    lead: 'batch applies both changes first and runs each binding once when it returns. The summary is written once, so a click costs two text edits instead of three.',
    Demo: BatchCounter,
    source: batchSource,
  },
  {
    slug: 'keyed-list',
    track: 'board',
    title: 'A keyed list',
    lead: 'For renders one row per key, once. After a lap the board is in a new order: the rows that kept their key keep their nodes, and only the rows that changed places are moved. The board counts two node writes per moved row, and a text edit for every place and distance that changed.',
    Demo: KeyedBoard,
    source: keyedListSource,
  },
  {
    slug: 'five-hundred',
    track: 'board',
    title: 'Five hundred rows',
    lead: 'The same race on a field of hundreds, timed in your browser: each lap is measured from the write to the finished layout, and the median and 95th percentile appear once 20 laps are timed. Then give every row a new key on every lap: For throws each row away and builds it again, and the board and the timings show what that costs.',
    Demo: LiveBoard,
    source: fiveHundredSource,
  },
];
