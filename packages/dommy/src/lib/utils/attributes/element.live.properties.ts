/**
 * Props that hold live element state: the user changes them, so they are set as properties.
 * Their attributes only hold the initial (default) state, and `indeterminate` has none.
 */
const liveProperties = ['value', 'checked', 'selected', 'indeterminate', 'muted'] as const;

const livePropertiesSet: Set<string> = new Set(liveProperties);

export const isLiveProperty = (property: string): property is (typeof liveProperties)[number] =>
  livePropertiesSet.has(property);

/**
 * Sets a live state prop as an element property (`el.value = v`), not as an attribute.
 *
 * @template Element - The type of the HTML element being modified.
 * @param {Element} element - The target element.
 * @param {string} property - One of the live properties (`value`, `checked`, …).
 * @param {unknown} value - The new value.
 * @returns {Element} The same element.
 */
export const setLiveProperty = <Element extends HTMLElement>(
  element: Element,
  property: (typeof liveProperties)[number],
  value: unknown
): Element => {
  Reflect.set(element, property, value);
  return element;
};
