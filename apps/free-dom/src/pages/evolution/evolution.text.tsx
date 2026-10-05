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
      lead: 'Every HTML tag is a function that returns a real DOM element: props first, children after. There is no template language and no virtual DOM, so the elements you build are the ones the browser shows. Inspect the card in your devtools and you will find plain section, a, img and span elements. The board under the demo counts the nodes the card built at first render; every other count stays at zero, because nothing writes to the DOM after that.',
    },
    jsx: {
      title: 'The same markup in JSX',
      lead: 'The same card, written in JSX. JSX reads like HTML and compiles to the same function calls, so the card is built from exactly the same nodes: the board shows the same count as in step 1. One thing to notice in the source: props are DOM properties, so the class goes in className.',
    },
    components: {
      title: 'Components from data',
      lead: 'The three links differ only in their data, so the data moves into an array and one LinkItem component draws each link. A component is a plain function of props, and map turns the data into elements. It runs once and returns nodes: there is no re-render to schedule. The board still shows the same nodes and no writes.',
    },
    dom: {
      title: 'Interactivity by hand',
      lead: 'A new demo: concert tickets. Click +1 a few times. The number sits in an output, the HTML element for a result; elementRef hands that element to the code, and the click handler redraws it with replaceChildren. Watch the board: every click adds 2 to nodes added or removed, because the old text node goes and a new one takes its place. Click −1 at zero and the count goes below zero: nothing guards it yet.',
    },
    signal: {
      title: 'State in a signal',
      lead: 'A signal is a value that knows who reads it. The number moves from a variable into a signal, and the click handlers only write tickets.value. An effect reads tickets.value, so it runs again after every write and redraws the output. Click +1: the page works as before, and so does the board, two nodes added or removed per click, because the effect still replaces the whole text.',
    },
    'bind-by-hand': {
      title: 'Bind by hand',
      lead: 'Now the elementRef function does more than hand the element over: it starts an effect that writes tickets.value into the output’s textContent. Subscribing an element to a signal this way is a binding by hand, and the effect now lives next to the output it writes. Click +1 and look at the board: still two nodes per click, because setting textContent throws the text node away and makes a new one. In the next step dommy keeps one text node and edits it.',
    },
    bind: {
      title: 'Bind the signal',
      lead: 'Pass the signal itself as a child, and dommy does the binding: it creates one text node and changes its text on every write. Click +1 and the board shows one text edit and nothing else: no node added, none removed. Inspect the output in your devtools while you click: the same text node stays, only its text changes. This is the whole idea of dommy.',
    },
    derived: {
      title: 'Derived values',
      lead: 'A computed value derives from signals and is bound like one. Here the ticket plan (empty, single, or a group from two tickets) lands in the output’s data-plan attribute. Start at zero and click +1: one text edit and one attribute edit, since the plan went from empty to single. The second click makes it a group: another attribute edit. The third click changes only the number; the plan is still a group, so the attribute is not written.',
    },
    getter: {
      title: 'A getter in a prop',
      lead: 'Until now −1 could take the count below zero. Here disabled gets a function, and any function in a prop is bound like a signal, so the button follows the tickets without a computed. It starts disabled. Click +1: the board shows two attribute edits, data-plan and disabled. Click +1 again: disabled is still false, so it is not written. Click back to zero and it is written once more.',
    },
    'two-signals': {
      title: 'Two signals, the summary written twice',
      lead: 'A ticket in the cart is a seat taken from the hall, so each click writes two signals, tickets and seatsLeft, and the summary under the buttons reads both. Click +1 and the board shows three text edits: the number, then the summary twice. Updates are synchronous, so the summary is redrawn after the first write, with the ticket in the cart and its seat still free, and again after the second.',
    },
    batch: {
      title: 'Group writes with batch',
      lead: 'Wrap the two writes in batch: both apply first, and each binding runs once when batch returns. Click +1 and compare with step 10: two text edits instead of three, the number and the summary. The summary is written once, and the in-between state never reaches the page.',
    },
    'keyed-list': {
      title: 'A keyed list',
      lead: 'A new demo: a watchlist of eight stocks, ranked by today’s change. For renders one row per key, once. Click Update prices and the rows sort into a new order. A row that kept its key keeps its nodes, and For moves as few rows as the new order needs. On the board, nodes moved goes up while nodes added or removed stays at zero, and each row’s bindings make a text edit only for a rank or a change that differs.',
    },
    'five-hundred': {
      title: 'Five hundred rows',
      lead: 'The same list for a whole index of five hundred stocks, timed in your browser. Click Start: the prices update four times a second, and each update is measured from the write to the finished layout. The median and the 95th percentile appear once 20 updates are timed. Pick 100 or 300 stocks to compare. Then tick New keys every update: every key is new, so For throws each row away and builds it again. At 500 stocks the board shows a thousand nodes added or removed per update, and the timings start over for the new mode, so you see what that costs.',
    },
  } satisfies Record<StepSlug, { title: string; lead: string }>,
};

/** The words of reely evolution: the rail, the page around a step, and every step's title and lead. */
export type EvolutionText = typeof en;

export const evolutionText = localized(en, () => import('./evolution.text.ru').then((module) => module.ru));
