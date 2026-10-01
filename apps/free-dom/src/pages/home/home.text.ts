import { localized } from '../../i18n/localized';

import type { SitePackage } from '../../site/site.packages';

/** The packages that draw the scoreboard; the credits name the part each one does. */
export const boardPackages = ['signals', 'dommy', 'dommy-kit'] as const satisfies readonly SitePackage[];

type BoardPackage = (typeof boardPackages)[number];

const en = {
  documentTitle: 'reely: small TypeScript packages, no dependencies',
  title: 'reely — small TypeScript packages, no dependencies',
  lead: 'Each one does one job, is typed for your tsc and ships only what you import; none needs anything outside reely. Take one, or let several work together, as on this board.',
  builtWith: 'This site is built with them.',
  board: {
    madeWith: 'The board is made with',
    parts: {
      signals: 'the standings and the times',
      dommy: 'the rows and their letters',
      'dommy-kit': 'when letters turn, and stillness under reduced motion',
    } satisfies Record<BoardPackage, string>,
  },
  packages: {
    title: 'Packages',
    lead: 'In the order they stack: each is built only on packages listed before it.',
  },
};

export type HomeText = typeof en;

export const homeText = localized(en, () => import('./home.text.ru').then((module) => module.ru));
