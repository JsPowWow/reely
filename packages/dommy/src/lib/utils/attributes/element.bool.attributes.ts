import { removeAttribute, setAttribute } from './element.attributes';

const booleanAttributes = [
  'disabled',
  'readonly',
  'required',
  'hidden',
  'multiple',
  'autofocus',
  'controls',
  'loop',
  'playsinline',
  'open',
] as const;

export const booleanAttributesSet: Set<string> = new Set(booleanAttributes);

export const isBooleanAttribute = (attributeName: string): attributeName is (typeof booleanAttributes)[number] =>
  booleanAttributesSet.has(attributeName);

export const setBoolAttribute = <Element extends HTMLElement>(
  element: Element,
  attributeName: string,
  value: boolean
): Element => {
  if (value) {
    setAttribute(element, attributeName, '');
  } else {
    removeAttribute(element, attributeName);
  }
  return element;
};
