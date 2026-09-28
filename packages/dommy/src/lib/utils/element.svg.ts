import type { SvgElementTag } from '../types/svg.types';

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

// every SVG-only tag, checked against the DOM typings: a missing or unknown tag fails typecheck
const svgTagTable = {
  animate: true,
  animateMotion: true,
  animateTransform: true,
  circle: true,
  clipPath: true,
  defs: true,
  desc: true,
  ellipse: true,
  feBlend: true,
  feColorMatrix: true,
  feComponentTransfer: true,
  feComposite: true,
  feConvolveMatrix: true,
  feDiffuseLighting: true,
  feDisplacementMap: true,
  feDistantLight: true,
  feDropShadow: true,
  feFlood: true,
  feFuncA: true,
  feFuncB: true,
  feFuncG: true,
  feFuncR: true,
  feGaussianBlur: true,
  feImage: true,
  feMerge: true,
  feMergeNode: true,
  feMorphology: true,
  feOffset: true,
  fePointLight: true,
  feSpecularLighting: true,
  feSpotLight: true,
  feTile: true,
  feTurbulence: true,
  filter: true,
  foreignObject: true,
  g: true,
  image: true,
  line: true,
  linearGradient: true,
  marker: true,
  mask: true,
  metadata: true,
  mpath: true,
  path: true,
  pattern: true,
  polygon: true,
  polyline: true,
  radialGradient: true,
  rect: true,
  set: true,
  stop: true,
  svg: true,
  switch: true,
  symbol: true,
  text: true,
  textPath: true,
  tspan: true,
  use: true,
  view: true,
} as const satisfies Record<SvgElementTag, true>;

const svgTags: ReadonlySet<string> = new Set(Object.keys(svgTagTable));

/**
 * Checks whether a tag exists only in SVG, so it is created in the SVG namespace.
 *
 * @param {string} tag - A tag name.
 * @returns {boolean} True for `svg`, `path`, `circle` and the other SVG-only tags.
 */
export function isSvgTag(tag: string): tag is SvgElementTag {
  return svgTags.has(tag);
}
