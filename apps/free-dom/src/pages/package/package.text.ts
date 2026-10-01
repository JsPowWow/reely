import { localized } from '../../i18n/localized';

import type { PagedPackage } from '../../site/site.packages';

interface ExampleText {
  title: string;
  claim: string;
}

const en = {
  version: 'Version',
  readme: 'Read the README',
  npm: 'See it on npm',
  console: 'What reached the console',
  inDommyDocs: 'See them drive the DOM in dommy’s docs',
  exports: 'What it exports',
  exportsNote: 'The values you can import; its types are in the README.',
  examples: {
    basics: {
      title: 'One tracker blocked, the order still reported',
      claim:
        'forEachSettled calls every analytics tracker even when one throws, then throws that error once each has had its turn; messageOf reads its message whatever was thrown.',
    },
    signals: {
      title: 'Two changes, one save',
      claim:
        'The total is computed from the quantity and the discount. The bulk order changes both inside one batch, so the effect that saves the draft runs once, as its count shows. The signals know no DOM: dommy binds them here.',
    },
    'dommy-kit': {
      title: 'A text size that outlives a reload',
      claim:
        'persisted keeps a signal in localStorage and follows writes from other tabs; media follows a media query. Both stop with the render that made them.',
    },
    emitter: {
      title: 'A notice every part of the app hears',
      claim:
        'Any part of the app emits one typed notice. The chat widget’s listener throws, and the toasts and the unread badge hear it anyway; emit throws the widget’s error once all have run.',
    },
    queue: {
      title: 'Two crews, five cars',
      claim:
        'An AsyncQueue with a concurrency of 2 starts the next car as soon as a crew is free, never three at once, and says drain when the pit lane is empty.',
    },
    'state-machine': {
      title: 'Start lights that cannot be fooled',
      claim:
        'The buttons send their events without checking the state. The machine times a launch only after the lights go out, turns one under the lights into a jump start, and refuses one on the grid.',
    },
    'simple-store': {
      title: 'The coupon banner hears only of coupons',
      claim:
        'No signals here: the badge and the banner subscribe to an ObjectStore by hand. The banner follows a select of the coupon, so adding an item never reaches it, and the same coupon twice is no change at all.',
    },
    logger: {
      title: 'A checkout you can listen to',
      claim:
        'A named scope from scopedLogger, checkout here, stays silent until it is enabled, while the default scope always logs. logWith logs a value between two steps of a promise chain and passes it on. What reaches the console is echoed under the demo.',
    },
    async: {
      title: 'Exchange rates on a bad day',
      claim:
        'The first call fails and the second hangs. retry waits 500 ms, then 1000 ms, cuts the hanging attempt at its 1.5 s timeout, and the third gets the rates; leaving the page cancels whatever is left.',
    },
    colors: {
      title: 'A whole button from one brand colour',
      claim:
        'lighten and darken make the hover and pressed shades; getContrastRatio measures black and white text on the colour, and the demo takes the one that contrasts more and checks it against WCAG AA (4.5:1).',
    },
    strings: {
      title: 'Blog addresses from post titles',
      claim:
        'capitalize gives every word a capital, in any script; slugify makes the address: a Latin letter loses its accent, Cyrillic stays as it is, anything but letters, digits and hyphens goes.',
    },
  } satisfies Record<PagedPackage, ExampleText>,
};

export type PackageText = typeof en;

export const packageText = localized(en, () => import('./package.text.ru').then((module) => module.ru));
