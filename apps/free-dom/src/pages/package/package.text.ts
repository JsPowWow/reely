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
      title: 'A mail client where every message has an address',
      claim:
        'Open a folder, then a letter: each is an address, /:folder/:id, and its route gets the params already typed. The links come from href and the same pattern, so renaming a route can’t leave a stale link behind. Try a folder that isn’t there: it answers nothing and drops through to the page for unknown paths. The address bar on top belongs to the demo, whose history lives in memory.',
    },
    routerLazy: {
      title: 'Settings that load when you open them',
      claim:
        'Billing and Notifications are chunks that take their time. Meanwhile the page you’re on stays put, and the bar under the address says something’s coming. Click Billing and then Notifications straight away: Billing still loads, but only the last click wins, so you never see it. Reports never loads at all, and fail gives that a page too.',
    },
    routerSearch: {
      title: 'A search you can send as a link',
      claim:
        'The form goes to /search?q=…&sort=…, and the route reads both from the query it gets right after its params. So a link is a search: Chairs by price, the sort links and More lamps are plain links. Nothing hides outside the address, and each page is just an element.',
    },
    routerGuard: {
      title: 'A guard that sends you to sign in, and back',
      claim:
        'Orders and Account open only for a signed-in reader. Signed out, the route sends you to /login?next=… and answers nothing; signing in takes you on to next. Both moves pass { replace: true }, so the sign-in page never clogs Back. The guard is just a function around the route’s answer: the router doesn’t even know it’s there.',
    },
    routerGallery: {
      title: 'A gallery you can flip with the keyboard',
      claim:
        'The album and every photo have addresses, and Previous and Next wrap round the album. Focus the gallery and press the arrows: the keys read path() and move with navigate, a move from code like any other. Escape takes you back to the album. A photo that isn’t there answers nothing, and fail says so.',
    },
    routerHelp: {
      title: 'With dommy: a help widget with pages of its own',
      claim:
        '<Router> gets its own history, so the widget has pages while the site’s address stays put; followLinks hands it the widget’s links. The menu’s aria-current follows path(), and the bar under the address follows loading() while the help desk thinks. Each page lives under its own owner: vote on Returns, leave and come back, and the vote has gone with its page. A topic no route answers lands in catch.',
    },
    routerKeep: {
      title: 'With dommy: a currency that rides along',
      claim:
        'keep names the query params that are settings of the app, not pages. Pick USD, open a lamp, head back: the currency travels in the address on every move, and no route ever sees it. Now type a quantity and switch the currency: only a setting changed, so the page isn’t built again and your number stays. This site keeps ?lang the same way, so any address you copy opens in the language you see.',
    },
    routerFiles: {
      title: 'With dommy: a drive with folders in the path',
      claim:
        '/drive/*path takes the rest of the path, slashes and all, decoded. The route walks the folders and answers with a folder, a file or nothing. The crumbs are links from href, which encodes each segment and keeps the slashes: look at Office%20party in the address.',
    },
    routerIssues: {
      title: 'With dommy: issue filters that are links',
      claim:
        'State and label live in /issues?state=…&label=…, so each filter is a link that keeps the other one. The page binds to a signal of the issues: close one, go back to the open list, and it’s already one shorter, the count and the For list following the signal without another load.',
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
