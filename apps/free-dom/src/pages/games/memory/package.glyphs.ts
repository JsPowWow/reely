import { circle, ellipse, line, path, polyline, rect, svg } from '@reely/dommy';

import type { SitePackage } from '../../../site/site.packages';

// a picture of what each package does, drawn on a 24-unit grid in one 2-unit
// stroke
const shapes = {
  basics: (): SVGElement[] => [
    rect({ x: 3, y: 13, width: 8, height: 8 }),
    rect({ x: 13, y: 13, width: 8, height: 8 }),
    rect({ x: 8, y: 3, width: 8, height: 8 }),
  ],
  signals: (): SVGElement[] => [
    polyline({ points: '2 12 7 12 10 4 14 20 17 12 22 12' }),
  ],
  router: (): SVGElement[] => [
    path({ d: 'M6 21V3' }),
    path({ d: 'M6 14c0-4 3-6 7-6h7' }),
    polyline({ points: '17 5 20 8 17 11' }),
  ],
  dommy: (): SVGElement[] => [
    polyline({ points: '8 6 2 12 8 18' }),
    polyline({ points: '16 6 22 12 16 18' }),
    line({ x1: 14, y1: 4, x2: 10, y2: 20 }),
  ],
  'dommy-kit': (): SVGElement[] => [
    rect({ x: 3, y: 8, width: 18, height: 12, rx: 1 }),
    path({ d: 'M9 8V5h6v3' }),
    line({ x1: 3, y1: 13, x2: 21, y2: 13 }),
  ],
  emitter: (): SVGElement[] => [
    circle({ cx: 12, cy: 12, r: 2 }),
    path({ d: 'M8 8a6 6 0 0 0 0 8' }),
    path({ d: 'M16 8a6 6 0 0 1 0 8' }),
    path({ d: 'M5 5a10 10 0 0 0 0 14' }),
    path({ d: 'M19 5a10 10 0 0 1 0 14' }),
  ],
  queue: (): SVGElement[] => [
    rect({ x: 2, y: 5, width: 5, height: 8 }),
    rect({ x: 9.5, y: 5, width: 5, height: 8 }),
    rect({ x: 17, y: 5, width: 5, height: 8 }),
    line({ x1: 2, y1: 18, x2: 22, y2: 18 }),
    polyline({ points: '19 15 22 18 19 21' }),
  ],
  'state-machine': (): SVGElement[] => [
    circle({ cx: 5, cy: 12, r: 3 }),
    circle({ cx: 19, cy: 12, r: 3 }),
    path({ d: 'M7.5 9.5c3-3 6-3 9 0' }),
    path({ d: 'M16.5 14.5c-3 3-6 3-9 0' }),
    polyline({ points: '14 9 16.5 9.5 16.5 7' }),
  ],
  'simple-store': (): SVGElement[] => [
    ellipse({ cx: 12, cy: 5, rx: 8, ry: 3 }),
    path({ d: 'M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5' }),
    path({ d: 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3' }),
  ],
  logger: (): SVGElement[] => [
    rect({ x: 4, y: 2, width: 16, height: 20, rx: 1 }),
    line({ x1: 8, y1: 7, x2: 16, y2: 7 }),
    line({ x1: 8, y1: 12, x2: 16, y2: 12 }),
    line({ x1: 8, y1: 17, x2: 13, y2: 17 }),
  ],
  async: (): SVGElement[] => [
    circle({ cx: 12, cy: 12, r: 9 }),
    polyline({ points: '12 7 12 12 15.5 14' }),
  ],
  colors: (): SVGElement[] => [
    circle({ cx: 9, cy: 9, r: 5 }),
    circle({ cx: 15, cy: 9, r: 5 }),
    circle({ cx: 12, cy: 15, r: 5 }),
  ],
  strings: (): SVGElement[] => [
    path({ d: 'M2 12c3-7 6 7 10 0s7 7 10 0' }),
    circle({ cx: 2, cy: 12, r: 0.5 }),
    circle({ cx: 22, cy: 12, r: 0.5 }),
  ],
} satisfies Record<SitePackage, () => SVGElement[]>;

/**
 * The picture on the face of a package's card; decorative, since the card names
 * the package.
 */
export const packageGlyph = (name: SitePackage): SVGSVGElement =>
  svg(
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      aria: { ariaHidden: 'true' },
    },
    ...shapes[name]()
  );
