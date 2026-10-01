---
paths:
  - "packages/basics/**"
---
# @reely/basics (`scope:shared`, published)

- **A library in its own right.** Small general helpers a stranger would install for themselves; every export makes sense to a consumer who uses no other `@reely` package. It is never a store for whatever other `@reely` packages happen to share.
- **Grows by promotion from `@reely/utils`.** A helper moves here once it is production-grade: total over its inputs, tested, typed for a consumer, a short JSDoc. The code moves; `@reely/utils` re-exports it for internal callers, so nothing is duplicated. Over time the useful part of utils lives here.
- **A guard narrows what it checked.** Its type comes from the value (`hasSome<T>(value: T): value is NonNullable<T>`), never from a type argument the caller picks; where types cannot follow the runtime, say so in the code, not in a guard.
- Other `@reely` packages import these helpers from `@reely/basics` (a dependency kept external in their builds), so an app ships each helper once.
- Same shape as utils: one function — one file, a spec next to it, named exports. No dependencies. Tree-shakes (see `CLAUDE.md`): a helper ships alone.
