import { isNil } from '@reely/utils';

import type { DommyElement } from '../../types/dommy.types';
/**
 * Props that hold live element state: the user changes them, so they are set as properties.
 * Their attributes only hold the initial (default) state, and `indeterminate` has none.
 */
const liveProperties = ['value', 'checked', 'selected', 'indeterminate', 'muted'] as const;

const livePropertiesSet: Set<string> = new Set(liveProperties);

export const isLiveProperty = (property: string): property is (typeof liveProperties)[number] =>
  livePropertiesSet.has(property);

// what `null` and `undefined` clear the state to: an empty `value`, the rest unset
const clearedState = (property: (typeof liveProperties)[number]): string | boolean =>
  property === 'value' ? '' : false;

export const setLiveProperty = <Element extends DommyElement>(
  element: Element,
  property: (typeof liveProperties)[number],
  value: unknown
): Element => {
  Reflect.set(element, property, isNil(value) ? clearedState(property) : value);
  return element;
};
