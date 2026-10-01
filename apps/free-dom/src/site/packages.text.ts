import { localized } from '../i18n/localized';

import type { SitePackage } from './site.packages';

// what the home page's plates and each package's page say of a package
const en = {
  gzip: 'gzip, with what it uses',
  builtOn: 'Built on',
  standsAlone: 'Stands on its own',
  why: {
    basics: 'Typed guards and error helpers: hasSome, isPlainObject, forEachSettled.',
    signals: 'Signals, computed values and effects, with owners that release what they subscribed. No DOM.',
    router: 'Typed routes, lazy pages, links and the back button taken over, scroll and focus kept. Any app, no framework.',
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
};

export type PackagesText = typeof en;

export const packagesText = localized(en, () => import('./packages.text.ru').then((module) => module.ru));
