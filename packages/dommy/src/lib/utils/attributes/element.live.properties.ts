import type { DommyElement } from '../../types/dommy.types';
/**
 * Props that hold live element state: the user changes them, so they are set as properties.
 * Their attributes only hold the initial (default) state, and `indeterminate` has none.
 */
const liveProperties = ['value', 'checked', 'selected', 'indeterminate', 'muted'] as const;

const livePropertiesSet: Set<string> = new Set(liveProperties);

export const isLiveProperty = (property: string): property is (typeof liveProperties)[number] =>
  livePropertiesSet.has(property);

export const setLiveProperty = <Element extends DommyElement>(
  element: Element,
  property: (typeof liveProperties)[number],
  value: unknown
): Element => {
  Reflect.set(element, property, value);
  return element;
};
