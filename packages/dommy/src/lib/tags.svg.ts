import { createElement } from './createElement';
import { isValidChildDOMNode } from './utils/element.utils';

import type { SvgElementFactoryFunction, SvgElementTag } from './types/svg.types';

// Factories for the SVG tags in common use; every other SVG tag works through JSX and `createElement`.
export const svg = createSvgElementFromTag('svg');
export const g = createSvgElementFromTag('g');
export const defs = createSvgElementFromTag('defs');
export const symbol = createSvgElementFromTag('symbol');
export const use = createSvgElementFromTag('use');
export const path = createSvgElementFromTag('path');
export const circle = createSvgElementFromTag('circle');
export const ellipse = createSvgElementFromTag('ellipse');
export const line = createSvgElementFromTag('line');
export const polyline = createSvgElementFromTag('polyline');
export const polygon = createSvgElementFromTag('polygon');
export const rect = createSvgElementFromTag('rect');
export const text = createSvgElementFromTag('text');
export const tspan = createSvgElementFromTag('tspan');
export const textPath = createSvgElementFromTag('textPath');
export const image = createSvgElementFromTag('image');
export const foreignObject = createSvgElementFromTag('foreignObject');
export const linearGradient = createSvgElementFromTag('linearGradient');
export const radialGradient = createSvgElementFromTag('radialGradient');
export const stop = createSvgElementFromTag('stop');
export const clipPath = createSvgElementFromTag('clipPath');
export const mask = createSvgElementFromTag('mask');
export const pattern = createSvgElementFromTag('pattern');
export const marker = createSvgElementFromTag('marker');

function createSvgElementFromTag<Tag extends SvgElementTag>(tag: Tag): SvgElementFactoryFunction<Tag> {
  return (props, ...children) => {
    if (isValidChildDOMNode(props)) {
      return createElement(tag, null, [props, ...children]);
    }
    return createElement(tag, props, ...children);
  };
}
