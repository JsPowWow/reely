---
paths:
  - "packages/utils/**"
  - "packages/logger/**"
---
# @reely/utils and @reely/logger (`scope:shared`)

- **One function — one file:** `src/lib/<group>/<fnName>.ts` (groups: `objects`, `fp`, `nullable`, `errors`, `types`), spec next to it, **named export** re-exported from `src/index.ts` (default exports are being phased out — don't add new ones).
- Guards return `x is T`; dual-mode helpers (`mapNullable(f)` vs `mapNullable(f, v)`) use overloads — follow the existing pattern.
- Specs: `test.each` tables covering primitives, wrappers, `null`/`undefined`, edge cases (see `hasSome.spec.ts`).
- `utils` is private (not published). A published package that imports it must not leak `@reely/utils` into its emitted JS/`.d.ts` — bundle it or publish it (decided in JsPowWow/reely#1).
- Don't touch `lib/utils.ts` `validateType` without the author — `strings` depends on it.
- Logger: `scopedLogger(scope)` is a per-scope singleton; `default` is always on, others need `.setEnabled(true)`. Known bug to fix with a test: `error` calls `console.warn`.
