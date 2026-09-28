# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

JavaScript and TypeScript developers who meet reely on npm, GitHub or in a talk and want to know two things: is this worth trying, and how do I do X with it. They read at a desk, often with an editor open beside the page; some check on a phone first. Juniors must be able to follow without a background in reactivity; seniors come for the mechanism and the numbers. The author's colleagues, who first see reely in a talk from a shared screen, are one such group.

## Product Purpose

The site is the home and documentation of reely, whose library is `@reely/dommy`. It has three parts: a landing page that shows what dommy is and why it is worth trying, documentation by topic (each page answers one question with a live demo and its source), and "reely evolution", the same UI rebuilt step by step with one more feature per step. Success: a developer opens the docs from the landing page, and can build a small interactive UI with `@reely/dommy` after reading a few pages.

## Positioning

No virtual DOM and no re-render: tag factories and JSX return real DOM nodes, a component runs once, and a signal updates exactly the one DOM node bound to it. The site proves this instead of claiming it: every demo is live code from the repo, a meter under each demo counts the real DOM writes it causes, and the size and speed figures are measured.

## Operating Context

- Read alone on a laptop, often beside an editor; also shown on a projector or shared screen in talks; checked on a phone.
- Deployed by Netlify from the repo: `main` to https://reely-free-dom.netlify.app, every pull request to a deploy preview.
- The site is built with `@reely/dommy` itself; the sources shown on the page are the modules that render the demos (imported with `?highlight`: Shiki colors them at build time, so the page ships no highlighter), so the code on screen is always the code that runs.
- Routes: the landing page at `/`, documentation under `/docs/…`, reely evolution under `/evolution/…`.

## Capabilities and Constraints

- Documentation topics: getting started, elements and JSX, components, signals, bindings, `batch`, keyed lists (`For`), conditions (`Show`), mount and cleanup, performance.
- reely evolution keeps the chain: markup (tag factories, the same markup in JSX, components from data), then interactivity (a counter by hand, signals, bindings, derived values, `batch`), then keyed lists and a five-hundred-row race board; each step marks the lines that are new since the previous step.
- All copy is in English for now; code and comments are English too. English and Russian are planned, on reely's own signals.
- The whole site uses only `@reely/*` packages at runtime: no other UI framework or runtime dependency.
- The repo principle applies to the site as well: minimal, yet mature.
- `@reely/dommy` is published as a pre-release: `npm i @reely/dommy@next` installs the current API; `latest` is still an old 0.0.x.

## Brand Commitments

- The name on the site is reely; the library users install is `@reely/dommy`. "free-dom" is only the app's name inside the repo and does not appear as a brand.
- Author: JsPowWow; source at https://github.com/JsPowWow/reely.
- Voice: plain and precise, like a good engineer explaining their own code to a teammate.
- The visual world is race timing: asphalt ground, graphite ink, signal yellow and flag red, a condensed display face; the landing page is the same world, bolder.

## Evidence on Hand

- Sizes, gzip, measured on the packed tarball with esbuild: an app that uses only signals ships 1.3 kB of dommy; a typical JSX app with `For`, `Show` and `mount` 4.7 kB; the whole package 6.3 kB. No runtime dependencies.
- Speed: a 500-row keyed race board re-sorts in a median of 7.7 ms per lap (95th percentile 8.7 ms) in headless Chrome, measured from the write to the finished layout; the performance page times it live in the visitor's own browser.
- The live demos and their DOM-write counts: `apps/free-dom/src/pages/tutorial/steps/`.
- The library source and its tests: `packages/dommy`; first real consumer: JsPowWow/ai-race.
- There are no testimonials, user counts, stars or adopters beyond ai-race; do not invent them.

## Product Principles

1. Show, then tell: every claim about the DOM is visible in a live demo or its write counter.
2. One question per docs page, one new idea per evolution step.
3. The code on the page is the code that runs; there are no simplified copies.
4. Minimal, yet mature: a small API, and nothing shown that is not finished.
5. Honest about status: what is pre-release or unmeasured is stated as such.
