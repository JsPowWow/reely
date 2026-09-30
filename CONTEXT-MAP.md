# Context Map

## Contexts

- [signals](./packages/signals/CONTEXT.md): signals, computed values, effects and owners, without the DOM
- [dommy](./packages/dommy/CONTEXT.md): DOM element factories, JSX runtime, signal bindings, async router
- [utils](./packages/utils/CONTEXT.md): shared guards, fp (`pipe`, `Either`, `Maybe`), nullable helpers, errors, types
- [logger](./packages/logger/CONTEXT.md): scoped logging
- [state-machine](./packages/state-machine/CONTEXT.md): finite state machine for app logic, independent of the DOM

`CONTEXT.md` files are created lazily, when the first term is resolved.
`async`, `strings`, `colors` and `apps/*` get an entry when they get a `CONTEXT.md`.

## Relationships

- **dommy → signals, utils, logger**: binds signals to the DOM and re-exports them; uses guards, fp steps
  and shared types, and the scoped logger; the published dommy must not import utils or logger in its
  emitted `.d.ts`/JS
- **dommy-kit → signals, basics, utils**: browser helpers over signals, released through the owner; no
  dommy at runtime (its specs render with it); the published kit must not import utils in its emitted
  `.d.ts`/JS
- **signals → basics, utils**: guards and shared types; knows nothing of the DOM; the published signals
  must not import utils in its emitted `.d.ts`/JS
- **logger → utils**: shared types and guards
- **state-machine → utils, queue, emitter**: guards and shared types; `SyncQueue`/`AsyncQueue` run its transitions, the emitter tells listeners of a state change; dommy does not depend on it, and it knows nothing of signals
