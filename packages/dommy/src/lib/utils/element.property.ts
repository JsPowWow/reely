import { isInstanceOf, isNil } from '@reely/utils';

import { getDommyLogger } from '../config';
import { isSafeAttributeEntry, removeAttribute, setAttribute } from './attributes/element.attributes';
import { isBooleanAttribute, setBoolAttribute } from './attributes/element.bool.attributes';
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
    case isBooleanAttribute(attributeName): {
      return setBoolAttribute(element, attributeName, Boolean(value));
    }
    case isNil(value): {
      return removeAttribute(element, attributeName);
    }
    case isDataAttribute(property):
    case isSafeAttributeEntry(attributeName, value): {
      return setAttribute(element, attributeName, String(value));
    }
    default: {
      getDommyLogger()?.warn(`The element property was not assigned: `, property, value);
      return element;
    }
  }
};
