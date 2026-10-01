import { localized } from '../../i18n/localized';
import { DocLink } from '../docs/docs.live';

import type { DommyExampleId } from './dommy.examples';

const en = {
  documentTitle: '@reely/dommy: real DOM, one write per change',
  title: 'Real DOM. One write per change.',
  pitch:
    '@reely/dommy builds real DOM from tag factories and JSX, and binds each signal to the one node it changes. No virtual DOM, no re-render, no third-party dependencies.',
  builtWith: 'This page, its examples and their write counters are built with reely.',
  examples: {
    signals: {
      title: 'One keystroke, two text edits',
      claim:
        'Type a username. The page address and the characters left are the two text nodes bound to it, so each keystroke edits those two, and the board counts nothing else.',
    },
    elements: {
      title: 'The element itself',
      claim:
        'A tag factory returns the real HTMLButtonElement, typed as one, so addButton.animate() needs no ref, and the little pop writes nothing to the DOM.',
    },
    lists: {
      title: 'Rows move, they are not rebuilt',
      claim:
        'Type a note in any row, then reverse the list: the board counts moved nodes and no new ones, and your note moves with its row.',
    },
    async: {
      title: 'Only the latest answer',
      claim:
        'Type eff quickly. This server answers shorter queries later, as a slow network would; Await shows the answer to the latest query and drops the late ones, counted under the results.',
    },
  } satisfies Record<DommyExampleId, { title: string; claim: string }>,
  numbers: {
    title: 'Size and speed',
    caption: 'Sizes minified and gzipped, measured on the npm tarball',
    signalsOnly: 'An app that uses only signals ships',
    jsxApp: 'A JSX app with For, Show and mount ships',
    wholePackage: 'The whole package',
    Note: (): Node => (
      <>
        Bundled with esbuild. Time a 500-row board in your own browser on <DocLink slug='performance'>Size and speed</DocLink>
        .
      </>
    ),
    stepByStep: 'See it built step by step',
    github: 'Source on GitHub',
  },
};

/** The words of the dommy page, its examples' titles and claims included. */
export type DommyText = typeof en;

export const dommyText = localized(en, () => import('./dommy.text.ru').then((module) => module.ru));
