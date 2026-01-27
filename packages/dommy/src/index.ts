export { defineDommyConfig } from './lib/config';
export { createElement } from './lib/createElement';
export { createObjectReference } from '@reely/utils';
export { addListener, addListeners } from './lib/utils/element.addListeners';
export { appendTo, appendChildren, replaceChildrenOf } from './lib/utils/element.children';

export * from './lib/types/dommy.types';
export * from './lib/types/event.types';
export { dommy } from './lib/tags';
export { jsx } from './lib/jsx-runtime';
export * from './lib/tags.predefined';
export { setAttribute, removeAttribute, isSafeAttributeEntry } from './lib/utils/attributes/element.attributes';
export { setStyleAttributes, hasStylesAttribute } from './lib/utils/attributes/element.style.attributes';

export { reelx } from './lib/reactive/reelx/reelx.core';
export * from './lib/reactive/reelx/reelx.types';
export { type Signal, signal, type Computed, computed, effect } from './lib/reactive/preact-like/preact-like.signal';
