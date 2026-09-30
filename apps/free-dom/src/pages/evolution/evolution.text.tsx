import { localized } from '../../i18n/localized';

import type { StepSlug } from './evolution.steps';

const en = {
  home: 'reely evolution',
  railLabel: 'Evolution steps',
  Keys: (): Node => (
    <>
      Use <kbd>←</kbd> and <kbd>→</kbd> to move between steps.
    </>
  ),
  /** Names a step by its number, before its title. */
  step: (number: number): string => `Step ${number}.`,
  documentTitle: 'reely evolution',
  missing: {
    title: (slug: string): string => `There is no step “${slug}”`,
    lead: 'Pick a step from the list, or start from the beginning.',
    start: 'Start with step 1',
  },
  caption: {
    changed: (since: number): string => `Highlighted: new since step ${since}`,
    fresh: 'A new demo starts here',
  },
  ending: {
    title: 'Where to go from here',
    Text: (): Node => (
      <>
        Every step ran on @reely/dommy: install it with <code>npm i @reely/dommy</code>, and look up each part in the
        docs.
      </>
    ),
    docs: 'Read the docs',
  },
  steps: {
    factories: {
      title: 'Markup with tag factories',
      lead: 'Every HTML tag is a function that returns a real DOM element: props first, children after. No template language and no virtual DOM, so what you build is what the browser shows. The board under the demo counts the nodes the card built once; nothing is written to the DOM after that.',
    },
    jsx: {
      title: 'The same markup in JSX',
      lead: 'JSX reads like HTML and compiles to the same function calls, so the card renders exactly the same nodes. Props are DOM properties, so the class goes in className.',
    },
    components: {
      title: 'Components from data',
      lead: 'The three links differ only in their data. A component is a plain function of props, and map turns the data into elements. It runs once: there is no re-render to schedule.',
    },
    dom: {
      title: 'Interactivity by hand',
      lead: 'An element keeps its listeners, so a click can change the page. Here it picks concert tickets: the number sits in an output, the HTML element for a result; elementRef hands that element over, and the click handler redraws it by hand. Watch the board under the demo: each click removes one text node and adds another.',
    },
    signal: {
      title: 'State in a signal',
      lead: 'A signal is a value that knows who reads it. The number moves from a variable into a signal, and an effect that reads tickets.value runs again after every change, so the click handlers only write the signal. The effect still redraws the whole output: the board counts a removed and an added node on every click.',
    },
    'bind-by-hand': {
      title: 'Bind by hand',
      lead: 'Now the elementRef function does more than hand the element over. Subscribing that element to the signal is a binding by hand: the effect now lives with the output it writes. Setting textContent still swaps the text node, as the board shows; next, dommy keeps one text node and edits it.',
    },
    bind: {
      title: 'Bind the signal',
      lead: 'Pass the signal itself as a child, and dommy does the binding: it creates one text node and edits its text on every change. A click now changes that text and nothing else: one text edit, no nodes added or removed. This is the whole idea of dommy.',
    },
    derived: {
      title: 'Derived values',
      lead: 'A computed value derives from signals and is bound like one. The ticket plan (empty, single, or a group from two tickets) lands in a data attribute, so the board now counts attribute edits: one for each click that changes the plan.',
    },
    getter: {
      title: 'A getter in a prop',
      lead: 'Any function in a prop is bound like a signal, so disabled follows the tickets without a computed. It is written only when its value really changes: once when the cart leaves zero, and again when it comes back.',
    },
    'two-signals': {
      title: 'Two signals, the summary written twice',
      lead: 'A ticket in the cart is a seat taken from the hall, so each press changes two signals, and the summary reads both. Updates are synchronous, so the summary is written after the first change and again after the second: three text edits per click.',
    },
    batch: {
      title: 'Group writes with batch',
      lead: 'batch applies both changes first and runs each binding once when it returns. The summary is written once, so a click costs two text edits instead of three.',
    },
    'keyed-list': {
      title: 'A keyed list',
      lead: 'For renders one row per key, once. Here it ranks a watchlist by today’s change. After a price update the list is in a new order: the rows that kept their key keep their nodes, and only the rows that changed places are moved. The board counts two node writes per moved row, and a text edit for every rank and change that differs.',
    },
    'five-hundred': {
      title: 'Five hundred rows',
      lead: 'The same movers for a whole index of five hundred stocks, timed in your browser: each update is measured from the write to the finished layout, and the median and 95th percentile appear once 20 updates are timed. Then give every row a new key on every update: For throws each row away and builds it again, and the board and the timings show what that costs.',
    },
  } satisfies Record<StepSlug, { title: string; lead: string }>,
};

/** The words of reely evolution: the rail, the page around a step, and every step's title and lead. */
export type EvolutionText = typeof en;

export const evolutionText = localized(en, () => import('./evolution.text.ru').then((module) => module.ru));
