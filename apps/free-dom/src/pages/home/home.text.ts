import { localized } from '../../i18n/localized';

import type { SitePackage } from '../../site/site.packages';

/** The packages that draw the scoreboard; the credits name the part each one does. */
export const boardPackages = ['signals', 'dommy', 'dommy-kit'] as const satisfies readonly SitePackage[];

type BoardPackage = (typeof boardPackages)[number];

const en = {
  documentTitle: 'reely: small TypeScript packages, no dependencies',
  title: 'reely — small TypeScript packages, no dependencies',
  lead: 'Each package does one job, is typed for your tsc and ships only what you import; none needs anything from outside reely. Use one, or let several work together, as on this race board: when a car passes another, its row slides to its new place, moved and not rebuilt. Pause it to read the times.',
  builtWith: 'This site is built with them.',
  findPackage: 'Find your package',
  facts: {
    packages: 'packages, none of them the main one',
    outside: 'dependencies from outside reely',
    lightest: 'the lightest, minified and gzipped',
  },
  board: {
    madeWith: 'The board is made with',
    parts: {
      signals: 'the race in one signal, the standings computed from it',
      dommy: 'the rows, kept by key and moved when a car passes',
      'dommy-kit': 'flip slides the rows, later times the flaps, media keeps them still under reduced motion',
    } satisfies Record<BoardPackage, string>,
  },
  packages: {
    title: 'Packages',
    lead: 'In the order they stack: each is built only on packages listed before it.',
  },
};

export type HomeText = typeof en;

export const homeText = localized(en, () => import('./home.text.ru').then((module) => module.ru));
