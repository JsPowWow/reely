export { defineDommyConfig } from './lib/config';
export { createElement } from './lib/createElement';
export { mount } from './lib/mount';
export { onCleanup } from './lib/reactive/owner';
export { For, type ForProps } from './lib/flow.for';
export { Show, type ShowProps } from './lib/flow.show';
export { Await, type AwaitProps } from './lib/flow.await';
export { createObjectReference } from '@reely/utils';
export { addListener, addListeners } from './lib/utils/element.addListeners';
export { appendTo, appendChildren, replaceChildrenOf } from './lib/utils/element.children';

export * from './lib/types/dommy.types';
export * from './lib/types/event.types';
export { Fragment } from './lib/jsx-runtime';
export type { JSX } from './lib/types/jsx.types';
export * from './lib/tags.predefined';
export * from './lib/tags.svg';
export type * from './lib/types/svg.types';
export { setAttribute, removeAttribute, isSafeAttributeEntry } from './lib/utils/attributes/element.attributes';
export { setStyleAttributes, hasStylesAttribute } from './lib/utils/attributes/element.style.attributes';

export { reelx } from './lib/reactive/reelx/reelx.core';
export * from './lib/reactive/reelx/reelx.types';
export {
  type Signal,
  signal,
  type Computed,
  computed,
  effect,
  batch,
  untracked,
} from './lib/reactive/preact-like/preact-like.signal';

