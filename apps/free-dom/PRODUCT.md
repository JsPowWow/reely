# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

JavaScript and TypeScript developers who meet reely on npm, GitHub or in a talk and want to know two things: which of these packages solves my problem, and how do I do X with it. They read at a desk, often with an editor open beside the page; some check on a phone first. Juniors must be able to follow without a background in reactivity; seniors come for the mechanism and the numbers. The author's colleagues, who first see reely in a talk from a shared screen, are one such group.

## Product Purpose

The site is the home and documentation of reely, a family of small TypeScript packages with no dependencies, all on equal terms: `@reely/dommy` (DOM from tag factories and JSX, bound to signals), `@reely/signals`, `@reely/dommy-kit`, `@reely/basics`, `@reely/state-machine`, `@reely/emitter`, `@reely/queue`, `@reely/simple-store`, `@reely/async`, `@reely/colors`, `@reely/strings`, `@reely/logger`. It has a landing page that shows the packages working together and lets a visitor find theirs; a page per package (why it exists, a live example, install, its exports); dommy's documentation by topic and "reely evolution", the same UI rebuilt step by step; and labs, the experiments around reely with their verdicts. Success: a developer leaves the landing page for the page of a package that solves their problem, and can use it after reading that page.

## Positioning

Small packages that each do one thing for a consumer who uses no other `@reely` package, typed for a consumer's `tsc`, tree-shaken down to what is imported, with no runtime dependencies. dommy's part: no virtual DOM and no re-render; tag factories and JSX return real DOM nodes, a component runs once, and a signal updates exactly the one DOM node bound to it. The site proves this instead of claiming it: every demo is live code from the repo, a meter counts the real DOM writes a demo causes, and the sizes are measured by the build.

## Operating Context

- Read alone on a laptop, often beside an editor; also shown on a projector or shared screen in talks; checked on a phone.
- Deployed by Netlify from the repo: `main` to https://reely-free-dom.netlify.app, every pull request to a deploy preview.
- The site is built with `@reely/dommy` itself; the sources shown on the page are the modules that render the demos (imported with `?highlight`: Shiki colors them at build time, so the page ships no highlighter), so the code on screen is always the code that runs.
- Routes: the landing page at `/`, a page per package at `/<package>` (`/signals`, `/dommy-kit`, …), dommy's documentation under `/dommy/docs/…` and reely evolution under `/dommy/evolution/…`, labs at `/labs`.

## Capabilities and Constraints

- Documentation topics: getting started, elements and JSX, components, signals, bindings, `batch`, keyed lists (`For`), conditions (`Show`), async (`Await`), mount and cleanup, performance.
- reely evolution keeps the chain: markup (tag factories, the same markup in JSX, components from data), then interactivity (a ticket picker by hand, signals, bindings, derived values, `batch`), then keyed lists and a five-hundred-stock board of top movers; each step marks the lines that are new since the previous step.
- Copy in English and Russian, switched on reely's own signals; code and comments are English.
- The whole site uses only `@reely/*` packages at runtime: no other UI framework or runtime dependency.
- The repo principle applies to the site as well: minimal, yet mature.
- Only published packages appear, with plain versions: `npm i @reely/<package>` installs the API the site shows. A change to a package's API updates its page and demos in the same change.
- Labs is its own section, not dommy's: every lab in `labs-ignore` with its question and verdict.

## Brand Commitments

- The name on the site is reely; users install its packages, `@reely/<package>`, each on its own. No package is the main one. "free-dom" is only the app's name inside the repo and does not appear as a brand.
- Author: JsPowWow; source at https://github.com/JsPowWow/reely.
- Voice: plain and precise, like a good engineer explaining their own code to a teammate.
- The visual world is a race-timing screen: asphalt ground, graphite ink, signal yellow and flag red, a condensed display face. The stories vary: a race, AI::Race's, is told in two or three places only (the landing board, a pit crew, the start lights); every other example is a frontend developer's working day (a cart, a checkout log, analytics trackers, toasts, an order total, reader settings, a retried request), never one story told everywhere. A race is told plainly: positions, names and times, no laps, sectors or splits on the landing page.

## Evidence on Hand

- Sizes, gzip, measured by the site's build with esbuild from the packages built in the repo, never typed by hand: each package whole; for dommy also an app that uses only signals and a typical JSX app with `For`, `Show` and `mount`. No runtime dependencies.
- Speed: not quoted as a number (a headless-browser figure says nothing about the reader's machine); the performance page times a 500-row keyed board live in the visitor's own browser.
- The live demos and their DOM-write counts: `apps/free-dom/src/pages/`.
- The packages, their tests and consumer checks: `packages/*`; first real consumer: JsPowWow/ai-race, which uses dommy, signals, dommy-kit and the small helpers.
- There are no testimonials, user counts, stars or adopters beyond ai-race; do not invent them.

## Product Principles

1. Show, then tell: every claim is visible in a live demo, its write counter or a measured size.
2. One question per docs page, one new idea per evolution step, one package per package page.
3. The code on the page is the code that runs; there are no simplified copies.
4. Minimal, yet mature: a small API, and nothing shown that is not finished.
5. Honest about status: what is pre-release or unmeasured is stated as such.
