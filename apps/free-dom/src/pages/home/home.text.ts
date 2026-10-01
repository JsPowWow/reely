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
    gzip: 'gzip, with what it uses',
    builtOn: 'Built on',
    standsAlone: 'Stands on its own',
    why: {
      basics: 'Typed guards and error helpers: hasSome, isPlainObject, forEachSettled.',
      signals: 'Signals, computed values and effects, with owners that release what they subscribed. No DOM.',
      dommy: 'Real DOM from tag factories and JSX; a signal updates the one node bound to it.',
      'dommy-kit': 'Browser helpers over signals: media queries, element size, timers, storage, FLIP moves.',
      emitter: 'A typed publish-subscribe channel whose listeners cannot stop each other.',
      queue: 'Task queues: a sync one that runs to completion, an async one with a concurrency limit.',
      'state-machine': 'A finite state machine with a config that reads like XState’s.',
      'simple-store': 'Stores you subscribe to explicitly: a value, or a plain object changed a few fields at a time.',
      logger: 'Console loggers by scope; a named scope stays silent until you enable it.',
      async: 'Retry async work with backoff and a time limit, one task or several.',
      colors: 'Mix, lighten and darken colours, give them an alpha, check their contrast.',
      strings: 'Capitalise words and make URL slugs, in any script.',
    } satisfies Record<SitePackage, string>,
  },
};

export type HomeText = typeof en;

export const homeText = localized(en, () => import('./home.text.ru').then((module) => module.ru));
