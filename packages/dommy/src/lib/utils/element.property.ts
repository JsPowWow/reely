import { isBoolean } from '@reely/basics';
import { isInstanceOf, isNil } from '@reely/utils';

import { getDommyLogger } from '../config';
import { isSafeAttributeEntry, removeAttribute, setAttribute } from './attributes/element.attributes';
import { hasBooleanProperty, setBooleanProperty, setBoolAttribute } from './attributes/element.bool.attributes';
import { isDataAttribute } from './attributes/element.data.attributes';
import { isLiveProperty, setLiveProperty } from './attributes/element.live.properties';
import { toAttributeName } from './attributes/element.mapped.attributes';
import { assignSvgAttribute } from './attributes/element.svg.attributes';

import type { DommyElement } from '../types/dommy.types';

export const assignProperty = <Element extends DommyElement>(
  element: Element,
  property: string,
  value: unknown
): Element => {
  if (isInstanceOf(SVGElement, element)) {
    return assignSvgAttribute(element, property, value);
  }
  const attributeName = toAttributeName(property);
  switch (true) {
    case isLiveProperty(property): {
      return setLiveProperty(element, property, value);
    }
    case isNil(value): {
      return removeAttribute(element, attributeName);
    }
    case isBoolean(value) && hasBooleanProperty(element, property): {
      return setBooleanProperty(element, property, value);
    }
    case isDataAttribute(property): {
      return setAttribute(element, attributeName, String(value));
    }
    case isBoolean(value) && isSafeAttributeEntry(attributeName, value): {
      return setBoolAttribute(element, attributeName, value);
    }
    case isSafeAttributeEntry(attributeName, value): {
      return setAttribute(element, attributeName, String(value));
    }
    default: {
      getDommyLogger()?.warn(`The element property was not assigned: `, property, value);
      return element;
    }
  }
};
