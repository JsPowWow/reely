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
    router: {
      title: 'A mail client with folders',
      claim:
        'Every folder and message is an address: /:folder/:id hands its route the params, typed, and href makes the links from the same pattern. A folder the mailbox lacks answers nothing and falls through to the page for unknown paths; the menu follows path(). The history is kept in memory, so the address above is the demo’s, not the site’s.',
    },
    routerLazy: {
      title: 'Settings that load on demand',
      claim:
        'Billing and Notifications are chunks that take their time. The page shown stays until the next one has loaded, the bar under the address follows loading(), and only the latest click counts: open Billing, then Notifications at once, and Billing loads but never shows. Reports fails to load, and fail gives it a page.',
    },
    routerSearch: {
      title: 'A search that lives in the address',
      claim:
        'The form goes to /search?q=…&sort=…, and the route reads both from the query it gets after its params, so a link is a search too: Chairs by price, the sort links, More lamps. Each page here is a plain element.',
    },
    routerGuard: {
      title: 'A guard that sends you to sign in',
      claim:
        'Orders and Account answer only a signed-in reader. Signed out, the route sends the reader to /login?next=… and answers nothing; signing in goes on to next. Both moves pass { replace: true }, which in the browser keeps the sign-in page out of Back. A guard is a function around a route’s answer, nothing the router has to know of.',
    },
    routerGallery: {
      title: 'A photo gallery with keys',
      claim:
        'The album and each photo are addresses; Previous and Next are links that wrap round the album. Focus the gallery and the arrow keys move through the photos, Escape goes back to the album: the keys read path() and send the router with navigate, moves from code like any other. A photo the album lacks answers nothing, and fail says so.',
    },
    routerHelp: {
      title: 'With dommy: a help widget with pages',
      claim:
        '<Router> takes a history of its own, so the widget has pages and the site’s address stays put; followLinks hands it the widget’s links. The menu’s aria-current binds to path(), and the bar under the address to loading() while the help desk answers. Each page renders under its own owner: vote on Returns, leave and come back, and the vote is gone with the page it belonged to. A topic no route answers lands in catch.',
    },
    routerKeep: {
      title: 'With dommy: a setting that stays in the address',
      claim:
        'keep names the query params that are settings, not pages. Pick USD, open a lamp, go back: the currency rides along in the address on every move, and no route ever sees it. Type a quantity, then switch the currency: only a setting changed, so the page is not shown again and the number you typed stays.',
    },
    routerFiles: {
      title: 'With dommy: a drive with folders in the path',
      claim:
        '/drive/*path takes the rest of the path, slashes and all, decoded; the route walks the folders and answers a folder or a file, or nothing. The crumbs are links made by href, which encodes each segment and keeps the slashes: see Office%20party above.',
    },
    routerIssues: {
      title: 'With dommy: issue filters in the query',
      claim:
        'State and label live in /issues?state=…&label=…, so each filter is a link that keeps the other. The page binds to a signal of the issues: close one and the open list it goes back to has one fewer, the count and the For list following it without another load.',
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
  } satisfies Record<PagedPackage, ExampleText> & Record<string, ExampleText>,
};

export type PackageText = typeof en;

export const packageText = localized(en, () => import('./package.text.ru').then((module) => module.ru));
