import { createElement } from './createElement';
import { isValidChildDOMNode } from './utils/element.utils';

import type { SvgElementFactoryFunction, SvgElementTag } from './types/svg.types';

// Factories for the SVG tags in common use; every other SVG tag works through JSX and `createElement`.
export const svg = /* @__PURE__ */ createSvgElementFromTag('svg');
export const g = /* @__PURE__ */ createSvgElementFromTag('g');
export const defs = /* @__PURE__ */ createSvgElementFromTag('defs');
export const symbol = /* @__PURE__ */ createSvgElementFromTag('symbol');
export const use = /* @__PURE__ */ createSvgElementFromTag('use');
export const path = /* @__PURE__ */ createSvgElementFromTag('path');
export const circle = /* @__PURE__ */ createSvgElementFromTag('circle');
export const ellipse = /* @__PURE__ */ createSvgElementFromTag('ellipse');
export const line = /* @__PURE__ */ createSvgElementFromTag('line');
export const polyline = /* @__PURE__ */ createSvgElementFromTag('polyline');
export const polygon = /* @__PURE__ */ createSvgElementFromTag('polygon');
export const rect = /* @__PURE__ */ createSvgElementFromTag('rect');
export const text = /* @__PURE__ */ createSvgElementFromTag('text');
export const tspan = /* @__PURE__ */ createSvgElementFromTag('tspan');
export const textPath = /* @__PURE__ */ createSvgElementFromTag('textPath');
export const image = /* @__PURE__ */ createSvgElementFromTag('image');
export const foreignObject = /* @__PURE__ */ createSvgElementFromTag('foreignObject');
export const linearGradient = /* @__PURE__ */ createSvgElementFromTag('linearGradient');
export const radialGradient = /* @__PURE__ */ createSvgElementFromTag('radialGradient');
export const stop = /* @__PURE__ */ createSvgElementFromTag('stop');
export const clipPath = /* @__PURE__ */ createSvgElementFromTag('clipPath');
export const mask = /* @__PURE__ */ createSvgElementFromTag('mask');
export const pattern = /* @__PURE__ */ createSvgElementFromTag('pattern');
export const marker = /* @__PURE__ */ createSvgElementFromTag('marker');

function createSvgElementFromTag<Tag extends SvgElementTag>(tag: Tag): SvgElementFactoryFunction<Tag> {
  return (props, ...children) => {
    if (isValidChildDOMNode(props)) {
      return createElement(tag, null, [props, ...children]);
    }
    return createElement(tag, props, ...children);
  };
}
