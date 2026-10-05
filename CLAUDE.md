# reely

Nx monorepo (TypeScript, npm workspaces): publishable packages in `packages/`, demo apps in `apps/`. Overview for humans — `GEMINI.md`. Here — what you must know before changing code.

Talk to the user in Russian. Code, comments, commit messages — English.

## Principle: minimal, yet mature

The repo exists for `@reely/dommy` and the small `@reely/*` helpers it stands on. Every change — feature, fix, refactor — keeps both halves:

- **Minimal:** the smallest API that covers the real use case, one way to do a thing, few concepts, small files, no third-party runtime dependencies. A primitive that composes beats an option or a flag. Stubs, dead code and commented-out variants get deleted.
- **Mature:** what exists is production-grade — types that work for a consumer, behaviour covered by tests, no leaks, predictable timing, correct and safe DOM, documented public API, tree-shakeable.
- A capability the real consumer (JsPowWow/ai-race) needs is built fully or not at all. Touching code leaves it smaller and sturdier: improve it along the way, test real behaviour and bugs rather than trivia.

## Principle: clean architecture, low coupling, high cohesion

Every new module, fix and refactor follows these; a fix that has to cross a boundary means the code sits in the wrong place — move the code, keep the rule.

- **Dependencies point inward**, toward the general and stable: `basics`/`utils` ← signals (the reactive core) ← router ← DOM binding ← flow components and JSX ← kit ← apps. An inner layer never imports an outer one; the reactive core knows nothing of the DOM.
- **The outside world stays at the edge:** DOM, storage, clock, network are reached through thin adapters or taken as parameters, so the logic inside runs and is tested without them.
- **High cohesion:** a file, folder or package holds what changes together for one reason and is named after it; one that changes for several reasons is split.
- **Low coupling:** modules meet at a small typed interface — no reaching into another module's internals, no shared mutable state between modules, no cycles.

## Layout

- `packages/basics` — `@reely/basics`, published (`scope:shared`): production-grade helpers promoted from utils (`forEachSettled`, `reportUncaught`, `hasSome`, `isSomeFunction`, `isPlainObject`).
- `packages/utils` — `@reely/utils`, private (`scope:shared`): type guards, fp (`pipe`, `flow`, `Either`, `Maybe`), nullable helpers, errors, shared types. **One function — one file** (`src/lib/<group>/<fnName>.ts`) with a spec next to it.
- `packages/logger` — `@reely/logger` (`scope:shared`): `scopedLogger(scope)`, `logWith(level, prefix)` for `pipe`, `WithUseLogger<T>`.
- `packages/signals` — `@reely/signals`, published (`scope:shared`): `signal`/`computed`/`effect`/`batch`/`untracked` over `reelx`, a push-pull graph, and the owner (`withOwner`, `onCleanup`); no DOM.
- `packages/router` — `@reely/router`, published (`scope:shared`): typed routes (`defineRoutes`, `href`) and `startRouter` with the browser's history or `memoryHistory`; any page type, no framework.
- `packages/dommy` — `@reely/dommy`: DOM element factories, JSX runtime, bindings of `@reely/signals` (re-exported), the `Router` component over `@reely/router`. Its real consumer is JsPowWow/ai-race.
- `packages/dommy-kit` — `@reely/dommy-kit` (`scope:dommy`): browser helpers over signals (`media`, `size`, `throttled`, `persisted`, `listen`, `later`, `flip`), each stopping with the owner (render) that created it.
- `packages/async`, `strings`, `colors` — small published helpers (older, looser style — don't copy it).
- `apps/free-dom` — dommy playground; `apps/star-battle` — canvas game; `labs-ignore/` — experiments, not linted, not shipped.

## Commands

Always through Nx (caching, `^build` deps): `npx nx test dommy`, `npx nx lint dommy`, `npx nx typecheck dommy`, `npx nx build dommy`; before a commit — `npx nx affected -t lint test typecheck build`. Node 24 LTS (`.nvmrc`).

## Rules that must not break

- **Reuse `@reely/basics` and `@reely/utils` first**, in new code and in fixes alike. Guards (`hasSome`, `isNil`, `isSomeFunction`, `isString`, `hasProperty`…), `forEachSettled`, `reportUncaught`, `pipe`/`flow`, `noop`/`identity`, `exhaustiveGuard`, `toErrorWithMessage`, shared types (`Nullable`, `PipeableFn`, `AnyFunction`…). A published package imports a helper from `@reely/basics` where it lives there. No hand-written `typeof` checks and no local copies. Missing a general helper → add it to utils (own file + spec + named export), then use it; it moves to basics once production-grade.
- **No `as`** (ESLint `consistent-type-assertions: never`; allowed only in specs) — narrow with guards. No `any`, no `@ts-nocheck`/`@ts-ignore` in new code.
- **Explicit return types**, `import type` for types, `import/order` groups (`@reely/**` after externals), no import cycles.
- **Lean comments:** a short JSDoc on public API only; a code comment only for a non-obvious why. Never restate what the code says.
- **Module boundaries:** a package depends only on `scope:shared` and itself (`@nx/enforce-module-boundaries`).
- **Every feature and fix ships with Vitest tests** next to the source (`*.spec.ts`).
- **The site follows the API.** A change to a published package's API, and every new package, updates in the same change its README and its pages and live demos on the docs site (`apps/free-dom`); only published packages appear there.
- Published packages must work for a consumer: `npm i @reely/<pkg>` + `tsc` in a clean project — no imports of unpublished `@reely/*` in the emitted `.d.ts`/JS.
- **Tree-shakeable:** a consumer ships only what it uses, even with a bundler that ignores `/*#__PURE__*/` and `sideEffects`; module scope holds nothing a bundler cannot prove pure. How to write it, prove it (`consumer`, `consumer/shake.json`) and measure it (`scripts/shake-report.mjs`) — `.claude/rules/tree-shaking.md`.

## Git and release

- Conventional Commits with the Nx project as scope, checked by commitlint + husky: `feat(dommy): add \`For\` with keyed reorder`, `fix(utils): …`, `chore(source): …`. Identifiers in backticks. Linear history on `main`, no merge commits.
- The course (`apps/free-dom`) is built by Netlify itself (site `reely-free-dom`, repo linked through the Netlify GitHub App): `main` → https://reely-free-dom.netlify.app, every PR → a deploy preview. Build settings live in Netlify (package directory `apps/free-dom`, `npx nx build free-dom`, publish `apps/free-dom/dist`); the SPA redirect lives in `apps/free-dom/netlify.toml`.
- Release — only with the author: on `main`, `npx nx release version --projects <names>` (versions from Conventional Commits, or an explicit one: `npx nx release version 0.2.0 --projects @reely/dommy`; plain versions only, no pre-releases) makes a release commit and tags `release/{projectName}/{version}`; `git push --atomic origin main --follow-tags` then lets `.github/workflows/publish.yml` check and publish, through npm trusted publishing, every package whose version on main is tagged and not yet on npm, to dist-tag `latest`; after a failed run, fix and push, or run the workflow by hand. A new package is first published by the author, before that push, and trusted on npmjs.com: the package → Settings → Trusted Publisher → GitHub Actions, `JsPowWow` / `reely` / `publish.yml`, no environment (`npm trust github` answers `400`). The default npm registry on the author's machine is a corporate one — **publish only to `https://registry.npmjs.org`**.

Area rules — `.claude/rules/*.md` (loaded by path).

## Agent skills

Skills from mattpocock/skills (`c55ee46`, MIT) live in `.claude/skills/` and are mandatory:
`tdd` for every feature and fix, `codebase-design` for module interfaces,
`diagnosing-bugs` for bugs, `code-review` before committing code.

`impeccable` (pbakaus/impeccable, Apache-2.0; installed with
`npx --registry https://registry.npmjs.org impeccable@4.1.0 install --providers=claude --project`,
skill v4.3.1) — for design work on `apps/free-dom`. Its engine binary is per machine
(`scripts/bin`, ignored); its hooks go to the untracked `.claude/settings.local.json`.

### Issue tracker

GitHub Issues in `JsPowWow/reely` via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles, label = role name. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` → `packages/<pkg>/CONTEXT.md`; ADRs in `docs/adr/`
(system-wide) and `packages/<pkg>/docs/adr/`, each created with its first decision. See
`docs/agents/domain.md`.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
