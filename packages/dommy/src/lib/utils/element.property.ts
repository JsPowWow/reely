import { isNil } from '@reely/utils';

import { getDommyLogger } from '../config';
import { isSafeAttributeEntry, removeAttribute, setAttribute } from './attributes/element.attributes';
import { isBooleanAttribute, setBoolAttribute } from './attributes/element.bool.attributes';
import { isDataAttribute } from './attributes/element.data.attributes';
import { isLiveProperty, setLiveProperty } from './attributes/element.live.properties';
import { isMappedAttribute, setMappedAttribute, toAttributeName } from './attributes/element.mapped.attributes';

/**
 * Applies one static prop value: live state as a property, a boolean attribute,
 * a `null`/`undefined` as a removed attribute, a primitive as an attribute.
 *
 * @template Element - The type of the HTML element being modified.
 * @param {Element} element - The target element.
 * @param {string} property - The prop name.
 * @param {unknown} value - The prop value.
 * @returns {Element} The same element.
 */
export const assignProperty = <Element extends HTMLElement>(
  element: Element,
  property: string,
  value: unknown
): Element => {
  switch (true) {
    case isLiveProperty(property): {
      return setLiveProperty(element, property, value);
    }
    case isBooleanAttribute(property): {
      return setBoolAttribute(element, property, Boolean(value));
    }
    case isNil(value): {
      return removeAttribute(element, toAttributeName(property));
    }
    case isDataAttribute(property): {
      return setAttribute(element, property, String(value));
    }
    case isMappedAttribute(property): {
      return setMappedAttribute(element, property, String(value));
    }
    case isSafeAttributeEntry(property, value): {
      return setAttribute(element, property, String(value));
    }
    default: {
      getDommyLogger()?.warn(`The element property was not assigned: `, property, value);
      return element;
    }
  }
};
