# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Colleagues on the author's team, from juniors to seniors. The author first presents the course in a talk or team meeting from a shared screen; afterwards colleagues come back on their own, at a desk or on a phone, and go through the steps at their own pace. The course must make sense without a background in reactivity or framework internals, and still hold a senior's attention.

## Product Purpose

The site is the home of reely: a landing page for the library (what `@reely/dommy` does and how to start) and a step-by-step course that shows how a minimal DOM library works by building the same UI with one more reely feature per step. Success: a colleague who finished the course can explain what a tag factory, a signal and a binding do to the DOM, and can build a small interactive UI with `@reely/dommy`.

## Positioning

No virtual DOM and no re-render: tag factories and JSX return real DOM nodes, a component runs once, and a signal updates exactly the one DOM node bound to it. The course proves this instead of claiming it: every demo is live code from the repo, a meter under each demo counts the real DOM writes it causes, and each step shows its source with the lines that are new since the previous step marked.

## Operating Context

- Shown on a projector or shared screen during a talk, then read alone on a laptop or phone.
- Deployed by Netlify from the repo: `main` to https://reely-free-dom.netlify.app, every pull request to a deploy preview.
- The course is built with `@reely/dommy` itself; the step sources shown on the page are the modules that render the demos (imported with `?raw`), so the code on screen is always the code that runs.

## Capabilities and Constraints

- The course sequence has two parts. Markup: tag factories, the same markup in JSX, then components from data. Interactivity: a counter by hand, then signals, built-in bindings, `batch`, keyed lists, and finally a race scoreboard like the one in JsPowWow/ai-race, the library's first real consumer.
- All copy is in English; code and comments are English too.
- The whole site uses only `@reely/*` packages at runtime: no other UI framework or runtime dependency.
- The repo principle applies to the site as well: minimal, yet mature.
- Open: `@reely/dommy` 0.1 is not published to npm yet, so install instructions must not claim that `npm i @reely/dommy` gives the current API until the release happens.
- Open: bundle size and performance have not been measured; no size or speed figures until they are.

## Brand Commitments

- The name on the site is reely; the library users install is `@reely/dommy`. "free-dom" is only the app's name inside the repo and does not appear as a brand.
- Author: JsPowWow; source at https://github.com/JsPowWow/reely.
- Voice: plain and precise, like a good engineer explaining their own code to a teammate.

## Evidence on Hand

- The live demos and their DOM-write counts: `apps/free-dom/src/pages/tutorial/steps/`.
- The library source and its tests: `packages/dommy`.
- There are no benchmarks, size figures, testimonials, user counts or adopters beyond ai-race; do not invent them.

## Product Principles

1. Show, then tell: every claim about the DOM is visible in a live demo or its write counter.
2. One new idea per step, with the change against the previous step marked.
3. The code on the page is the code that runs; there are no simplified copies.
4. Minimal, yet mature: a small API, and nothing shown that is not finished.
5. Honest about status: what is not released or measured is stated as such.
