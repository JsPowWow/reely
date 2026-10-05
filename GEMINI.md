# GEMINI Context: @reely/source (Nx TypeScript Monorepo)

This repository is a production-ready TypeScript monorepo powered by [Nx](https://nx.dev). It contains a collection of interactive web applications and high-quality, publishable utility packages.

## 🚀 Project Overview

### Applications (`apps/`)
- **star-battle**: A high-performance, canvas-based 2D space shooter with local multiplayer, diverse ship types, and procedural environmental effects (asteroids, comets, nebulas). Built with raw TypeScript and custom game physics.
- **free-dom**: A web application serving as a playground and demonstration for the `@reely/dommy` library.
- **rss-async-race**: A web application (internal project).

### Packages (`packages/`)

From each `packages/*/package.json`:

- **@reely/async** (published): Retry an async task with exponential backoff, one task or several at once.
- **@reely/basics** (published): Small general helpers for TypeScript: typed, total over their inputs, tree-shakeable, no dependencies.
- **@reely/colors** (published): Convert, mix, lighten and darken colours (hex or CSS rgb()), give them an alpha, and check the contrast between two.
- **@reely/dommy** (published): DOM elements from tag factories and JSX, bound to signals: no virtual DOM, one DOM node updated per change.
- **@reely/dommy-kit** (published): Browser helpers over @reely/signals: media queries, element size, throttling, storage, listeners, timers and FLIP moves, each stopping with the render that created it.
- **@reely/emitter** (published): A typed publish-subscribe channel: events by name, listeners that unsubscribe, errors that do not stop the others.
- **@reely/logger** (published): Scoped console loggers that stay silent until enabled, with a pass-through `logWith` for pipelines.
- **@reely/queue** (published): Task queues: a sync one that runs tasks to completion, and an async one with a concurrency limit.
- **@reely/router** (published): A small typed router for any web app: routes from path patterns, lazy pages, links and history taken over, scroll and focus kept, no framework.
- **@reely/signals** (published): Signals, computed values and effects: a push-pull graph with owners that release what a piece of work subscribed. No DOM.
- **@reely/simple-store** (published): Two tiny stores you subscribe to explicitly: a value, and a plain object changed a few fields at a time, with selections of their parts.
- **@reely/state-machine** (published): A finite state machine with a config that reads like XState's: sync by default, async on request, one transition at a time.
- **@reely/strings** (published): Capitalize words and make URL slugs.
- **@reely/utils** (private, not published): The monorepo's own helpers: type guards, `pipe` and `flow`, `Either` and `Maybe`, nullable helpers, errors and shared types.

## 🛠️ Tech Stack & Architecture

- **Build System**: [Nx](https://nx.dev) for task orchestration, caching, and dependency management.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode).
- **Bundler**: [Vite](https://vitejs.dev/) for apps and libraries.
- **Testing**: [Vitest](https://vitest.dev/) for unit and integration testing.
- **Linting & Formatting**: [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).
- **CI/CD**: GitHub Workflows with Nx Cloud, Husky for git hooks, and Commitlint for conventional commits.
- **Package Management**: npm with Nx Release for versioning and publishing.

## 🏃 Building and Running

Always use `npx nx` to run tasks to benefit from caching and dependency graph awareness.

### Global Commands
- **Install dependencies**: `npm install`
- **Build all projects**: `npx nx run-many -t build`
- **Run all tests**: `npx nx run-many -t test`
- **Lint all projects**: `npx nx run-many -t lint`
- **Type-check all**: `npx nx run-many -t typecheck`
- **Visualize graph**: `npx nx graph`

### Project-Specific Commands
- **Serve star-battle**: `npx nx serve star-battle`
- **Build a package**: `npx nx build <project>` (e.g., `npx nx build @reely/dommy`)
- **Test a package**: `npx nx test <package-name>`

### Release & Publishing
- **Dry run release**: `npx nx release --dry-run`
- **Perform release**: `npx nx release` (versions and tags)
- **Local Registry**: `npx nx local-registry` (starts Verdaccio)

## 📐 Development Conventions

### Module Boundaries
The project enforces strict architectural boundaries via Nx tags in `eslint.config.mjs`:
- `scope:shared` (utils) can be used by everyone.
- `scope:<package>` can only depend on `scope:shared`.
- Apps have their own scope tags.

### Code Style
- Follow the existing TypeScript patterns.
- Packages in `packages/` should be designed as publishable libraries.
- Prefer `@reely/dommy` for new UI development when applicable.
- Use `raw` TypeScript/Canvas for high-performance graphics as seen in `star-battle`.

### Testing
- Every new feature or fix should include corresponding Vitest tests.
- Run `npx nx affected -t test` before pushing to ensure no regressions.

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `chore:`).
- Husky and Commitlint will validate messages on commit.
