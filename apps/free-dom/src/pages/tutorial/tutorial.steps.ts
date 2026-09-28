import type { JSX } from '@reely/dommy';

import { ReelyLinks as FactoryLinks } from './steps/step1.factories';
import factoriesSource from './steps/step1.factories.ts?raw';
import { Counter as BatchCounter } from './steps/step10.batch';
import batchSource from './steps/step10.batch.ts?raw';
import { ReelyLinks as JsxLinks } from './steps/step2.jsx';
import jsxSource from './steps/step2.jsx.tsx?raw';
import { ReelyLinks as ComponentLinks } from './steps/step3.components';
import componentsSource from './steps/step3.components.tsx?raw';
import { Counter as DomCounter } from './steps/step4.dom';
import domSource from './steps/step4.dom.tsx?raw';
import { Counter as SignalCounter } from './steps/step5.signal';
import signalSource from './steps/step5.signal.ts?raw';
import { Counter as BoundCounter } from './steps/step6.bind';
import bindSource from './steps/step6.bind.ts?raw';
import { Counter as DerivedCounter } from './steps/step7.derived';
import derivedSource from './steps/step7.derived.ts?raw';
import { Counter as GetterCounter } from './steps/step8.getter';
import getterSource from './steps/step8.getter.ts?raw';
import { Counter as TwoSignalCounter } from './steps/step9.two-signals';
import twoSignalsSource from './steps/step9.two-signals.ts?raw';

/**
 * One step of the lesson: the markup steps build the same card three ways, then every step
 * builds the same counter with one more reely feature.
 */
export interface TutorialStep {
  slug: string;
  /** Steps that build the same demo share a track; a step's source is diffed against the previous step on its track. */
  track: 'links' | 'counter';
  title: string;
  lead: string;
  Demo: () => JSX.Element;
  source: string;
}

export const tutorialSteps: readonly TutorialStep[] = [
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
    lead: 'An element keeps its listeners, so a click can change the page. Here the counter keeps its number in a variable and redraws the output after every click. Watch the board under the demo: each click removes one text node and adds another.',
    Demo: DomCounter,
    source: domSource,
  },
  {
    slug: 'signal',
    track: 'counter',
    title: 'State in a signal',
    lead: 'A signal is a value that knows who reads it. The effect reads count.value, so it runs again after every change and redraws the output. The code says what the page shows, but the board still counts a removed and an added node on every click.',
    Demo: SignalCounter,
    source: signalSource,
  },
  {
    slug: 'bind',
    track: 'counter',
    title: 'Bind the signal',
    lead: 'Pass the signal itself as a child, and dommy binds it to one text node. A click now changes that node’s text and nothing else: one text edit, no nodes added or removed. This is the whole idea of dommy.',
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
];
