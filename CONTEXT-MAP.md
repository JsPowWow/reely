# Context Map

## Contexts

- [dommy](./packages/dommy/CONTEXT.md): DOM element factories, JSX runtime, signals, async router
- [utils](./packages/utils/CONTEXT.md): shared guards, fp (`pipe`, `Either`, `Maybe`), nullable helpers, errors, types
- [logger](./packages/logger/CONTEXT.md): scoped logging

`CONTEXT.md` files are created lazily, when the first term is resolved.
`async`, `strings`, `colors` and `apps/*` get an entry when they get a `CONTEXT.md`.

## Relationships

- **dommy → utils, logger**: uses guards, fp steps and shared types, and the scoped logger;
  the published dommy must not import them in its emitted `.d.ts`/JS
- **logger → utils**: shared types and guards
