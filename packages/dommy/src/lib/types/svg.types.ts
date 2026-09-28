import type { Nullable } from '@reely/utils';

import type { DOMElementAria, DOMElementStyles, MaybeReactive } from './attributes.types';
import type { ElementRef, ReactiveReelyNode, ReelyNode, StaticReelyNode } from './dommy.types';
import type { DOMElementEvents } from './event.types';

/**
 * Tags that exist only in SVG. `a`, `script`, `style` and `title` are HTML tags too, and JSX
 * builds children before their parent, so those four are always created as HTML elements.
 */
export type SvgElementTag = Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>;

export type SvgElement<Tag extends SvgElementTag> = SVGElementTagNameMap[Tag];

/**
 * SVG attributes as they are written in SVG (`viewBox`, `stroke-width`): geometry, presentation,
 * gradients, markers, filters and animation. Any `data-*` attribute is accepted too.
 */
export type SvgAttributeName =
  | 'viewBox'
  | 'preserveAspectRatio'
  | 'xmlns'
  | 'id'
  | 'tabindex'
  | 'lang'
  | 'href'
  | 'width'
  | 'height'
  | 'x'
  | 'y'
  | 'x1'
  | 'y1'
  | 'x2'
  | 'y2'
  | 'cx'
  | 'cy'
  | 'r'
  | 'rx'
  | 'ry'
  | 'fx'
  | 'fy'
  | 'fr'
  | 'dx'
  | 'dy'
  | 'd'
  | 'points'
  | 'pathLength'
  | 'transform'
  | 'rotate'
  | 'textLength'
  | 'lengthAdjust'
  | 'fill'
  | 'fill-opacity'
  | 'fill-rule'
  | 'stroke'
  | 'stroke-width'
  | 'stroke-opacity'
  | 'stroke-linecap'
  | 'stroke-linejoin'
  | 'stroke-miterlimit'
  | 'stroke-dasharray'
  | 'stroke-dashoffset'
  | 'opacity'
  | 'color'
  | 'display'
  | 'visibility'
  | 'vector-effect'
  | 'shape-rendering'
  | 'paint-order'
  | 'clip-path'
  | 'clip-rule'
  | 'mask'
  | 'filter'
  | 'marker-start'
  | 'marker-mid'
  | 'marker-end'
  | 'font-family'
  | 'font-size'
  | 'font-weight'
  | 'text-anchor'
  | 'dominant-baseline'
  | 'alignment-baseline'
  | 'letter-spacing'
  | 'offset'
  | 'stop-color'
  | 'stop-opacity'
  | 'gradientUnits'
  | 'gradientTransform'
  | 'spreadMethod'
  | 'markerWidth'
  | 'markerHeight'
  | 'markerUnits'
  | 'refX'
  | 'refY'
  | 'orient'
  | 'patternUnits'
  | 'patternContentUnits'
  | 'patternTransform'
  | 'clipPathUnits'
  | 'maskUnits'
  | 'maskContentUnits'
  | 'in'
  | 'in2'
  | 'result'
  | 'stdDeviation'
  | 'type'
  | 'values'
  | 'mode'
  | 'operator'
  | 'attributeName'
  | 'begin'
  | 'dur'
  | 'from'
  | 'to'
  | 'by'
  | 'repeatCount'
  | 'keyTimes';

export type SvgElementProps<Tag extends SvgElementTag, Elt extends SVGElement = SvgElement<Tag>> = {
  [K in SvgAttributeName | `data-${string}`]?: MaybeReactive<string | number>;
} & DOMElementEvents<Elt> & {
    /** Rendered as the `class` attribute. */
    className?: MaybeReactive<string>;
    styles?: DOMElementStyles;
    aria?: DOMElementAria;
    /** Identity of a list item; never rendered. */
    key?: PropertyKey;
    children?: ReelyNode;
    eventsAbortSignal?: AbortSignal;
    elementRef?: ElementRef<Elt>;
  };

/** The first argument of an SVG tag factory: props, or a child in place of props. */
export type SvgElementFactoryProps<Tag extends SvgElementTag> =
  | SvgElementProps<Tag>
  | StaticReelyNode
  | ReactiveReelyNode;

export type SvgElementFactoryFunction<Tag extends SvgElementTag> = (
  props?: Nullable<SvgElementFactoryProps<Tag>>,
  ...children: ReelyNode[]
) => SvgElement<Tag>;
