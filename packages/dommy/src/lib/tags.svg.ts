import { createElement } from './createElement';
import { isValidChildDOMNode } from './utils/element.utils';

import type { SvgElementFactoryFunction, SvgElementTag } from './types/svg.types';

// Factories for the SVG tags in common use; every other SVG tag works through JSX and `createElement`.
export const svg: SvgElementFactoryFunction<'svg'> = (...args) => fromTag('svg', ...args);
export const g: SvgElementFactoryFunction<'g'> = (...args) => fromTag('g', ...args);
export const defs: SvgElementFactoryFunction<'defs'> = (...args) => fromTag('defs', ...args);
export const symbol: SvgElementFactoryFunction<'symbol'> = (...args) => fromTag('symbol', ...args);
export const use: SvgElementFactoryFunction<'use'> = (...args) => fromTag('use', ...args);
export const path: SvgElementFactoryFunction<'path'> = (...args) => fromTag('path', ...args);
export const circle: SvgElementFactoryFunction<'circle'> = (...args) => fromTag('circle', ...args);
export const ellipse: SvgElementFactoryFunction<'ellipse'> = (...args) => fromTag('ellipse', ...args);
export const line: SvgElementFactoryFunction<'line'> = (...args) => fromTag('line', ...args);
export const polyline: SvgElementFactoryFunction<'polyline'> = (...args) => fromTag('polyline', ...args);
export const polygon: SvgElementFactoryFunction<'polygon'> = (...args) => fromTag('polygon', ...args);
export const rect: SvgElementFactoryFunction<'rect'> = (...args) => fromTag('rect', ...args);
export const text: SvgElementFactoryFunction<'text'> = (...args) => fromTag('text', ...args);
export const tspan: SvgElementFactoryFunction<'tspan'> = (...args) => fromTag('tspan', ...args);
export const textPath: SvgElementFactoryFunction<'textPath'> = (...args) => fromTag('textPath', ...args);
export const image: SvgElementFactoryFunction<'image'> = (...args) => fromTag('image', ...args);
export const foreignObject: SvgElementFactoryFunction<'foreignObject'> = (...args) => fromTag('foreignObject', ...args);
export const linearGradient: SvgElementFactoryFunction<'linearGradient'> = (...args) =>
  fromTag('linearGradient', ...args);
export const radialGradient: SvgElementFactoryFunction<'radialGradient'> = (...args) =>
  fromTag('radialGradient', ...args);
export const stop: SvgElementFactoryFunction<'stop'> = (...args) => fromTag('stop', ...args);
export const clipPath: SvgElementFactoryFunction<'clipPath'> = (...args) => fromTag('clipPath', ...args);
export const mask: SvgElementFactoryFunction<'mask'> = (...args) => fromTag('mask', ...args);
export const pattern: SvgElementFactoryFunction<'pattern'> = (...args) => fromTag('pattern', ...args);
export const marker: SvgElementFactoryFunction<'marker'> = (...args) => fromTag('marker', ...args);

// an arrow per tag, not a call at module scope, so an unused tag ships nothing even without annotations
function fromTag<Tag extends SvgElementTag>(
  tag: Tag,
  ...[props, ...children]: Parameters<SvgElementFactoryFunction<Tag>>
): ReturnType<SvgElementFactoryFunction<Tag>> {
  if (isValidChildDOMNode(props)) {
    return createElement(tag, null, [props, ...children]);
  }
  return createElement(tag, props, ...children);
}
