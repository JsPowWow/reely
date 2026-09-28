# reely

Nx monorepo (TypeScript, npm workspaces): publishable packages in `packages/`, demo apps in `apps/`. Overview for humans — `GEMINI.md`. Here — what you must know before changing code.

Talk to the user in Russian. Code, comments, commit messages — English.

## Layout
- `packages/utils` — `@reely/utils`, private (`scope:shared`): type guards, fp (`pipe`, `flow`, `Either`, `Maybe`), nullable helpers, errors, shared types. **One function — one file** (`src/lib/<group>/<fnName>.ts`) with a spec next to it.
- `packages/logger` — `@reely/logger` (`scope:shared`): `scopedLogger(scope)`, `logWith(level, prefix)` for `pipe`, `WithUseLogger<T>`.
- `packages/dommy` — `@reely/dommy`: DOM element factories, JSX runtime, signals (`reelx`, port of artalar/act), async router. Current work: JsPowWow/reely#1 (dommy 0.1 for JsPowWow/ai-race).
- `packages/async`, `strings`, `colors` — small published helpers (older, looser style — don't copy it).
- `apps/free-dom` — dommy playground; `apps/star-battle` — canvas game; `labs-ignore/` — experiments, not linted, not shipped.

## Commands
Always through Nx (caching, `^build` deps): `npx nx test dommy`, `npx nx lint dommy`, `npx nx typecheck dommy`, `npx nx build dommy`; before a commit — `npx nx affected -t lint test typecheck build`. Node ≥ 20.10 (`.nvmrc`).

## Rules that must not break
- **Reuse `@reely/utils` first.** Guards (`hasSome`, `isNil`, `isSomeFunction`, `isString`, `hasProperty`…), `pipe`/`flow`, `noop`/`identity`, `exhaustiveGuard`, `toErrorWithMessage`, shared types (`Nullable`, `PipeableFn`, `AnyFunction`…). No hand-written `typeof` checks or local copies. Missing a general helper → add it to utils (own file + spec + named export), then use it.
- **No `as`** (ESLint `consistent-type-assertions: never`; allowed only in specs) — narrow with guards. No `any`, no `@ts-nocheck`/`@ts-ignore` in new code.
- **Explicit return types**, `import type` for types, `import/order` groups (`@reely/**` after externals), no import cycles.
- **Module boundaries:** a package depends only on `scope:shared` and itself (`@nx/enforce-module-boundaries`).
- **Every feature and fix ships with Vitest tests** next to the source (`*.spec.ts`).
- Published packages must work for a consumer: `npm i @reely/<pkg>` + `tsc` in a clean project — no imports of unpublished `@reely/*` in the emitted `.d.ts`/JS.

## Git and release
- Conventional Commits with the Nx project as scope, checked by commitlint + husky: `feat(dommy): add \`For\` with keyed reorder`, `fix(utils): …`, `chore(source): …`. Identifiers in backticks. Linear history on `main`, no merge commits.
- Release — `nx release` (independent versions, tags `release/{projectName}/{version}`); publishing — manual workflow `.github/workflows/publish.yml`. Pre-releases of dommy: `0.1.0-next.N` with dist-tag `next`. The default npm registry on the author's machine is a corporate one — **publish only to `https://registry.npmjs.org`**, and never without the author.

Area rules — `.claude/rules/*.md` (loaded by path).

## Agent skills

Skills from mattpocock/skills (`c55ee46`, MIT) live in `.claude/skills/` and are mandatory:
`tdd` for every feature and fix, `codebase-design` for module interfaces,
`diagnosing-bugs` for bugs, `code-review` before committing code.

### Issue tracker

GitHub Issues in `JsPowWow/reely` via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles, label = role name. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `CONTEXT-MAP.md` → `packages/<pkg>/CONTEXT.md`; ADRs in `docs/adr/`
(system-wide) and `packages/<pkg>/docs/adr/`. See `docs/agents/domain.md`.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
