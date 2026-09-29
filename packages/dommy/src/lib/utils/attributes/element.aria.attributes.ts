import { hasSome } from '@reely/basics';
import { hasProperty, isNil } from '@reely/utils';

import { applyValue } from '../element.bindings';
import { removeAttribute, setAttribute } from './element.attributes';

import type { DOMElementAria } from '../../types/attributes.types';
import type { DommyElement } from '../../types/dommy.types';

export const hasAriaAttribute = <T>(props: T): props is T & { aria: DOMElementAria } => {
  return hasProperty('aria', props) && hasSome(props.aria);
};

// ARIA names are one lowercase word after `aria-`: `ariaKeyShortcuts` → `aria-keyshortcuts`.
const toAriaAttributeName = (property: string): string =>
  property.startsWith('aria') ? `aria-${property.slice('aria'.length).toLowerCase()}` : property;

// Attributes, unlike ARIA reflection, work everywhere.
export const setAriaAttributes = <Element extends DommyElement>(element: Element, aria: DOMElementAria): Element => {
  for (const [property, value] of Object.entries(aria)) {
    const attributeName = toAriaAttributeName(property);
    applyValue(value, (current) =>
      isNil(current) ? removeAttribute(element, attributeName) : setAttribute(element, attributeName, String(current))
    );
  }
  return element;
};
