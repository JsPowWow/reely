import { isBoolean } from '@reely/basics';
import { hasProperty, mapNullable } from '@reely/utils';

import { removeAttribute, setAttribute } from './element.attributes';

import type { DommyElement } from '../../types/dommy.types';

// a boolean property writes its attribute the way the DOM wants it: `disabled` present or absent,
// `draggable="false"`, `translate="no"`
export const hasBooleanProperty = (element: DommyElement, property: string): boolean =>
  hasProperty(property, element) && isBoolean(element[property]);

export const setBooleanProperty = <Element extends DommyElement>(
  element: Element,
  property: string,
  value: boolean
): Element => {
  Reflect.set(element, property, value);
  return element;
};

// enumerated attributes spell a boolean out, `[false, true]`; a missing property (jsdom, SSR) needs it
const spelledOut: ReadonlyMap<string, readonly [string, string]> = new Map([
  ['contenteditable', ['false', 'true']],
  ['draggable', ['false', 'true']],
  ['spellcheck', ['false', 'true']],
  ['translate', ['no', 'yes']],
]);

/**
 * A boolean attribute of a name without a property: an enumerated one spelled out, any other present
 * for `true`, absent for `false`.
 */
export const setBoolAttribute = <Element extends DommyElement>(
  element: Element,
  attributeName: string,
  value: boolean
): Element =>
  mapNullable(([no, yes]) => setAttribute(element, attributeName, value ? yes : no), spelledOut.get(attributeName)) ??
  (value ? setAttribute(element, attributeName, '') : removeAttribute(element, attributeName));
