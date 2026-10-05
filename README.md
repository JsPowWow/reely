# reely

Small TypeScript packages with no third-party runtime dependencies, built around [`@reely/dommy`](packages/dommy): DOM elements from tag factories and JSX, bound to signals. An [Nx](https://nx.dev) monorepo with npm workspaces; the docs site, with live demos, is https://reely-free-dom.netlify.app.

## Packages

| Package | | What it does |
| --- | --- | --- |
| [`@reely/async`](packages/async) | published | Retry an async task with exponential backoff, one task or several at once. |
| [`@reely/basics`](packages/basics) | published | Small general helpers for TypeScript: typed, total over their inputs, tree-shakeable, no dependencies. |
| [`@reely/colors`](packages/colors) | published | Convert, mix, lighten and darken colours (hex or CSS rgb()), give them an alpha, and check the contrast between two. |
| [`@reely/dommy`](packages/dommy) | published | DOM elements from tag factories and JSX, bound to signals: no virtual DOM, one DOM node updated per change. |
| [`@reely/dommy-kit`](packages/dommy-kit) | published | Browser helpers over @reely/signals: media queries, element size, throttling, storage, listeners, timers and FLIP moves, each stopping with the render that created it. |
| [`@reely/emitter`](packages/emitter) | published | A typed publish-subscribe channel: events by name, listeners that unsubscribe, errors that do not stop the others. |
| [`@reely/logger`](packages/logger) | published | Scoped console loggers that stay silent until enabled, with a pass-through `logWith` for pipelines. |
| [`@reely/queue`](packages/queue) | published | Task queues: a sync one that runs tasks to completion, and an async one with a concurrency limit. |
| [`@reely/router`](packages/router) | published | A small typed router for any web app: routes from path patterns, lazy pages, links and history taken over, scroll and focus kept, no framework. |
| [`@reely/signals`](packages/signals) | published | Signals, computed values and effects: a push-pull graph with owners that release what a piece of work subscribed. No DOM. |
| [`@reely/simple-store`](packages/simple-store) | published | Two tiny stores you subscribe to explicitly: a value, and a plain object changed a few fields at a time, with selections of their parts. |
| [`@reely/state-machine`](packages/state-machine) | published | A finite state machine with a config that reads like XState's: sync by default, async on request, one transition at a time. |
| [`@reely/strings`](packages/strings) | published | Capitalize words and make URL slugs. |
| [`@reely/utils`](packages/utils) | private | The monorepo's own helpers: type guards, `pipe` and `flow`, `Either` and `Maybe`, nullable helpers, errors and shared types. |

The descriptions are those of each `packages/*/package.json`. Apps, none of them published: `apps/free-dom` (the docs site and dommy playground), `apps/star-battle` (a canvas game), `apps/rss-async-race`.

## Working in the repo

Node from `.nvmrc`, then `npm ci`. Every task runs through Nx:

```sh
npx nx test @reely/dommy
npx nx run-many -t lint test typecheck build consumer
npx nx affected -t lint test typecheck build consumer   # before a commit
```

`consumer` installs a package from its tarball into a clean project and checks its types, that it runs, and that it tree-shakes. Commits follow Conventional Commits with the Nx project as scope. Releases: `npx nx release version` on `main` tags each package, and `.github/workflows/publish.yml` publishes it to npm.

## License

[MIT](LICENSE)
