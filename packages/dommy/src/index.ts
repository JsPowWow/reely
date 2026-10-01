export { defineDommyConfig, type DommyConfig } from './lib/config';
export { createElement } from './lib/createElement';
export { mount } from './lib/mount';
export { For, type ForProps } from './lib/flow/flow.for';
export { Show, type ShowProps } from './lib/flow/flow.show';
export { Await, type AwaitProps } from './lib/flow/flow.await';
export { Keyed, type KeyedProps } from './lib/flow/flow.keyed';

export * from './lib/types/dommy.types';
export * from './lib/types/event.types';
export { Fragment } from './lib/jsx-runtime';
export type { JSX } from './lib/types/jsx.types';
export * from './lib/tags.predefined';
export * from './lib/tags.svg';
export type * from './lib/types/svg.types';

export {
  type Signal,
  type SignalOptions,
  signal,
  type Computed,
  computed,
  effect,
  batch,
  untracked,
  onCleanup,
} from '@reely/signals';
