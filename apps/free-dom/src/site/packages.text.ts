import { localized } from '../i18n/localized';

import type { SitePackage } from './site.packages';

// what the home page's plates and each package's page say of a package
const en = {
  gzip: 'gzip, with what it uses',
  builtOn: 'Built on',
  standsAlone: 'Stands on its own',
  why: {
    basics:
      'Typed guards and error helpers: hasSome, isPlainObject, and forEachSettled, which calls every callback even when one throws.',
    signals: 'signal, computed, effect and batch, with owners that release what they subscribed. No DOM.',
    router:
      'Typed routes, lazy pages, links and Back taken over, scroll and focus where the reader expects them, and settings like ?lang that stay in the address. Any app, no framework.',
    dommy: 'Tag factories and JSX that return real DOM nodes; a signal updates only the node bound to it.',
    'dommy-kit':
      'Browser helpers over signals: media, size, throttled, persisted, listen, later, flip. Each stops with its render.',
    emitter: 'A typed event emitter: a listener that throws does not keep the others from hearing.',
    queue: 'Task queues: SyncQueue runs each task to completion, AsyncQueue runs a few at a time.',
    'state-machine':
      'A finite state machine with a config that reads like XState’s; an event a state does not take is refused.',
    'simple-store':
      'Stores you subscribe to by hand: a value, or a plain object changed a few fields at a time; select follows one part.',
    logger: 'Console loggers by scope; a named scope stays silent until you enable it.',
    async: 'retry with backoff, a timeout per attempt and an abort signal, for one task or several.',
    colors: 'Mix, lighten and darken colours, give them an alpha, and measure their contrast for WCAG.',
    strings: 'capitalize every word and slugify a title into a URL, in any script.',
  } satisfies Record<SitePackage, string>,
};

export type PackagesText = typeof en;

export const packagesText = localized(en, () => import('./packages.text.ru').then((module) => module.ru));
