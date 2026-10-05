import { localized } from '../../i18n/localized';
import { DocLink } from '../docs/docs.live';

import type { DommyExampleId } from './dommy.examples';

const en = {
  documentTitle: '@reely/dommy: real DOM, one write per change',
  title: 'Real DOM. One write per change.',
  pitch:
    '@reely/dommy builds real DOM from tag factories and JSX. A component runs once, and each signal is bound to the one node it changes, so a change costs the writes it needs and no more. No virtual DOM, no re-render, no third-party dependencies.',
  builtWith: 'This page, its examples and their write counters are built with reely.',
  examples: {
    signals: {
      title: 'One keystroke, two text edits',
      claim:
        'Type in the Username field and watch the write counter: each keystroke makes two text edits and nothing else. The page address and the characters left are the two text nodes bound to the username, so they are all a change has to touch. Clear the field and the address falls back to @you.',
    },
    elements: {
      title: 'The element itself',
      claim:
        'Click Add to cart: the button pops, and the write counter stays at zero. A tag factory returns the real HTMLButtonElement, typed as one, so addButton.animate() runs on it with no ref, and an animation writes nothing to the DOM. Under reduced motion the button pulses instead.',
    },
    lists: {
      title: 'Rows move, they are not rebuilt',
      claim:
        'Type a note in any row, then click Reverse or First to last. The counter shows nodes moved and none added, and your note travels with its row: For keeps one row per key and moves it when the order changes.',
    },
    async: {
      title: 'Only the latest answer',
      claim:
        'Type eff quickly. This server answers shorter queries later, as a slow network might: eff comes back first, then ef and e. Await shows the answer to the latest query and drops the late ones; their count is under the results.',
    },
  } satisfies Record<DommyExampleId, { title: string; claim: string }>,
  numbers: {
    title: 'Size and speed',
    caption: 'Sizes minified and gzipped, measured when the site is built',
    signalsOnly: 'An app that uses only signals ships',
    jsxApp: 'A JSX app with For, Show and mount ships',
    wholePackage: 'The whole package',
    Note: (): Node => (
      <>
        Bundled with esbuild. Time a 500-row board in your own browser on{' '}
        <DocLink slug='performance'>Size and speed</DocLink>.
      </>
    ),
    stepByStep: 'See it built step by step',
    github: 'Source on GitHub',
  },
};

/** The words of the dommy page, its examples' titles and claims included. */
export type DommyText = typeof en;

export const dommyText = localized(en, () => import('./dommy.text.ru').then((module) => module.ru));
