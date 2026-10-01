---
paths:
  - "packages/**"
  - "scripts/consumer-check.mjs"
---
# Tree shaking (every published `@reely/*` package)

A consumer ships only what it uses, even with a bundler that ignores `/*#__PURE__*/` and `sideEffects`. Every change to a package keeps that, and every new package starts that way.

## Writing the code
- **Module scope only declares.** Constants of literals, functions, arrows, classes without static blocks — nothing a bundler cannot prove pure. Work that has to happen runs inside a function, on first use.
- **A table is a literal.** `new Set(['value', 'checked'])` or `new Map(pairs)` of a literal is fine at module scope (esbuild proves it pure); a table built by a call — `new Set(Object.keys(svgTagTable))` — is not: read the literal in a function instead, `Object.hasOwn(svgTagTable, tag)`.
- **A family of exports is a family of arrows,** `export const a: Factory<'a'> = (...args) => fromTag('a', ...args);`, never `export const a = makeFactory('a')` — 136 such calls once made a bare `@reely/dommy` import ship 11 KB.
- **Each export lives where it can ship alone:** an export that needs a big helper imports it; a sibling that does not need it must not reach it through a shared module that also does work. Split the module when a lone export drags its siblings.
- `package.json` declares `"sideEffects": false`; a new entry (`exports` subpath) is shaken like the main one.

## Proving it
- The `consumer` target (`scripts/consumer-check.mjs`, which reads the entries from `exports`; dommy: `packages/dommy/consumer/check.mjs`) asserts a bare import of every entry ships nothing, with and without annotations. A new package gets the target before its first release.
- `consumer/shake.json` cases pin what matters: an export ships without its siblings (`absent`), a dependency shared with another `@reely` package ships once (`once`). Add a case with each export that could drag others in, and check that every `absent` name really exists in the full bundle, or the case proves nothing.
- Measure with `node scripts/shake-report.mjs <package dir> [entry]` after `npx nx build <project>`: each export alone, in B gzip, with and without annotations. Run it before and after a refactor and put the numbers that moved in the commit message.
