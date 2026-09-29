// Small helpers over signals and the owner, as their own entry: `@reely/dommy/kit`.
// The signal types the helpers return, so a consumer's declarations can name them.
export type { Computed, Signal } from './lib/reactive/preact-like/preact-like.signal';
export { flip } from './lib/kit/kit.flip';
export { later } from './lib/kit/kit.later';
export { listen, type EventMapOf } from './lib/kit/kit.listen';
export { machine, type Machine, type MachineEvent, type MachineState } from './lib/kit/kit.machine';
export { media } from './lib/kit/kit.media';
export { persisted, type PersistedOptions } from './lib/kit/kit.persisted';
export { size, type ElementSize } from './lib/kit/kit.size';
export { throttled } from './lib/kit/kit.throttled';
