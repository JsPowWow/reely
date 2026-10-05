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
      title: 'One tracker blocked, the order still counted',
      claim:
        'Click Place the order. The Ads pixel throws, as it would behind an ad blocker, and Product analytics and Data warehouse count the event all the same: forEachSettled calls every tracker, then throws the error once each has had its turn. The line under the button is messageOf at work: it reads a message out of whatever was thrown.',
    },
    signals: {
      title: 'Two changes, one save',
      claim:
        'Click One more: the quantity changes, the computed total follows, and the effect saves the draft once more, as its count shows. Now click Order 10 for the team. It sets the quantity and the discount inside one batch, so the effect runs once for both changes and the count goes up by one, not two. The signals know no DOM; dommy binds them here.',
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
        'Pick Large and reload the page: the text comes back large, because persisted keeps the signal in localStorage. Open this page in a second tab, pick Small there, and this tab follows: persisted listens for writes from other tabs. The line at the bottom is media following prefers-color-scheme; switch your system theme and watch it change. Both stop with the render that made them.',
    },
    emitter: {
      title: 'A notice every part of the app hears',
      claim:
        'Click Save the profile. The chat widget’s listener throws, yet the toast appears and the unread badge counts one: emit calls every listener on the typed channel and throws the widget’s error only once all have run, as the line at the bottom says. Lose the connection sends another notice the same way; the last three stay on screen.',
    },
    queue: {
      title: 'Two crews, five cars',
      claim:
        'Click Box all cars and watch the statuses. Never more than two cars are working: an AsyncQueue with a concurrency of 2 starts the next car the moment a crew is free. Falcon is done first, so Lynx goes in while Comet is still being served. When the last car leaves, the queue says drain and the line reads All cars served.',
    },
    'state-machine': {
      title: 'Start lights that cannot be fooled',
      claim:
        'Click Launch on the grid: the machine refuses it and nothing happens. Click Arm the lights: five lights come on a second apart and go out after a hold you cannot guess. Launch while they are lit and it is a jump start; launch after they go out and the machine times your reaction. The buttons send their events without checking the state; the machine alone decides what each one means. Reset puts you back on the grid.',
    },
    'simple-store': {
      title: 'The coupon banner hears only of coupons',
      claim:
        'Click Add an item a few times: the badge hears every change and the coupon banner none, because the banner subscribes to a select of the coupon, not to the whole cart. Apply SPRING10 and both hear it. Apply it again and neither does: the same coupon is no change at all. No signals here; each view subscribes to the ObjectStore by hand.',
    },
    logger: {
      title: 'A checkout you can listen to',
      claim:
        'Click Restore the cart and look at the console under the demo: nothing, because the checkout scope from scopedLogger stays silent until it is enabled. Tick Log the checkout scope, click again, and the line is there. Fail the payment writes through the default scope, which always logs. Work out the total shows logWith: it logs the prices, then the total, between the steps of a promise chain, and passes each value on.',
    },
    async: {
      title: 'Exchange rates on a bad day',
      claim:
        'Click Load the rates and watch the attempts come in. The first fails with HTTP 503, and retry waits 500 ms. The second hangs; retry cuts it at its 1.5 s timeout and waits 1000 ms, twice as long. The third gets the rates. Leave the page while it is still trying, and its signal cancels whatever is left.',
    },
    colors: {
      title: 'A whole button from one brand colour',
      claim:
        'Pick a brand colour, then hover over Start free trial and press it: lighten and darken made those two shades from your colour. getContrastRatio measures black and white text on it; the button takes whichever contrasts more, and the line under it checks that against the 4.5:1 of WCAG AA. Move the colour towards a pale yellow and the text turns black.',
    },
    strings: {
      title: 'Blog addresses from post titles',
      claim:
        'Edit the post title. capitalize gives every word a capital, in any script, and slugify makes the address under it: spaces become hyphens, and anything but letters, digits and hyphens goes, the “!” too. Type Café or Łódź and the Latin letters lose their accents; type a title in Cyrillic and it stays Cyrillic.',
    },
  } satisfies Record<PagedPackage, ExampleText> & Record<string, ExampleText>,
};

export type PackageText = typeof en;

export const packageText = localized(en, () => import('./package.text.ru').then((module) => module.ru));
