---
paths:
  - "packages/dommy/**"
  - "packages/signals/**"
  - "packages/dommy-kit/**"
  - "apps/free-dom/**"
---
# @reely/dommy

Signals bound to the DOM (point updates, no virtual DOM), owner/`dispose`, flow components, automatic JSX runtime; released on npm (0.1.0, JsPowWow/reely#1). First real consumer — JsPowWow/ai-race (a race scoreboard with split-flap letters: frequent point updates, row reordering); its needs drive what comes next.

## Minimal, yet mature (the repo principle in `CLAUDE.md`, applied to dommy)
- The public surface stays small: tag factories, `createElement`, JSX runtime, signals (`signal`/`computed`/`effect`/`batch`), `For`/`Show`/`Keyed`/`Await`, owner/`dispose`. The signals and the owner live in `@reely/signals` (no DOM, lib es2024) and dommy re-exports them; dommy binds them, never the other way round. A new export earns its place by serving ai-race; otherwise it composes from these.
- One reactive model: any function in a prop (other than `on*`) or a child is a reactive value, bound as a new pipe step. No second mechanism beside it.
- A signal has two access styles, both first-class: Preact's `.value` and Angular's `laps()` / `set` / `update`. They mix freely (a deliberate exception to "one way to do a thing", the author's choice); tests cover both.
- One render type: `children` and component results are `ReelyNode`; a JSX expression is always a `Node` (`toNode` puts the rest into a fragment). A component that returns a tag declares `(): Node`, any other declares `(): ReelyNode`. Terms — `packages/dommy/CONTEXT.md`.
- The main entry ships only finished code; the router lives in its own entry, `@reely/dommy/router`, so an app without routes ships none of it: `Router` is a component over `startRouter` of `@reely/router` (`defineRoutes`, `navigate`, `href`, `currentPath` re-exported from there); routing logic belongs in `@reely/router`, dommy only renders its pages. Browser helpers composed from signals (`media`, `size`, `throttled`, `persisted`, `listen`, `flip`, `later`) live in `@reely/dommy-kit`, a layer above dommy that imports only `@reely/signals` (dommy only in its specs), one file each (`src/lib/<name>.ts`), each releasing what it holds through the owner.
- Mature means: a bound value updates exactly one DOM node, every subscription is released by `dispose`, effects run synchronously (`batch` groups writes), types work in a consumer's `tsc`.

## Style (keep it — it is the author's)
- **Element transforms are curried `PipeableFn` steps** composed with `pipe` from `@reely/utils`: `assignElementRef(props)(el)`, `assignProperties(props)(el)`, `appendChildren(children)(el)`; `createElement` is `pipe(newElement, assignElementRef(p), assignProperties(p), appendChildren(c), assignLiveProperties(p))`: attributes before the children, live state after (a `select` is `multiple` before its options, and its `value` finds its option). New behaviour (signal binding, owner registration) — new steps in this chain, not a rewrite.
- Setters return the element, so they chain.
- Exported functions — `const` arrows with explicit return types; `function` only for guards, small internal helpers and overloaded exports (e.g. `createElement`), which a `const` cannot type without `as`. Guards are `is*`/`has*` with `x is T` predicates. `unknown` params are named `maybe*`.
- Files: `<subject>.<detail>[.<kind>].ts`, lowercase with dots — `element.listeners.ts`, `reelx.core.ts`, `element.bool.attributes.ts`, types in `*.types.ts`. One barrel — `src/index.ts`, explicit named exports (`export *` only for types).
- Lookup tables — `as const` + `Set`/`Map` of a literal, or the literal read with `Object.hasOwn` where a set would need a call (`.claude/rules/tree-shaking.md`); config objects checked with `satisfies`.
- Comments in English and lean (see `CLAUDE.md`): `@param`/`@returns` only where the signature does not say it; TODO as `// TODO AR`.
- Unused destructured fields — `_ignored*`.

## Reuse, don't duplicate
- Narrowing: `hasSome`, `isSomeFunction`, `isPlainObject` — from `@reely/basics`; `isNil`, `isString`/`isNumber`/`isBoolean`, `isPrimitiveValue`, `hasProperty`, `isInstanceOf`, `isNonEmpty`, `isKeyValueObject` (props: class instances too) — from `@reely/utils`. `switch` over a union ends with `exhaustiveGuard`.
- Unknown thrown values → `toErrorWithMessage`; risky calls → `Either.tryCatch`; defaults → `withDefault`/`mapNullable`.
- `noop`/`identity` instead of inline `() => {}` / `(x) => x`.
- Logging only through the dommy config logger (`getDommyLogger()?.warn(...)`), read **at call time**, never cached at module load. No `console.*`.
- A general helper dommy needs and utils lacks (e.g. `invariant`, `isArray`, microtask scheduling, disposable helpers) → add it to `@reely/utils` first (own file + spec), then import.

## DOM correctness
- Text goes through text nodes (`append(String(x))`, `text.data = v`) — never `innerHTML`.
- `value`, `checked`, `selected` and other live state — set as **properties** (`el[k] = v`), not attributes.
- `on*` takes a function, a `{ handleEvent, ...options }` descriptor (`once`, `capture`, `passive`, `signal`) or an array of them (`onclick` and `onClick`); a string in `on*` is rejected, never set as an attribute.
- SVG — `createElementNS`.
- Listeners are removable (`eventsAbortSignal`, `AbortSignal.any`); every subscription created during render belongs to an owner and is released by `dispose` — no leaks. Do not copy act's lazy `!isConnected` unsubscribe.

## Tests
- Environment `jsdom` for DOM specs (root has `jsdom ~22.1`; `apps/free-dom` already uses it). Pure signal specs may stay in `node`.
- For every binding: create → update signal → exactly one DOM node changed; `dispose` → zero subscribers (count them, don't guess).
- Keyed lists: insert, remove, reorder, same key → same node (identity check), focus kept.
