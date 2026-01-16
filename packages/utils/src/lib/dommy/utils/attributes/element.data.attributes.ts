import { hasSome } from '../../../objects/hasSome';

export const isDataAttribute = (attributeName: string): attributeName is `data-${string}` =>
  hasSome(attributeName) && attributeName.startsWith('data-');

export const setDataAttribute = <Element extends HTMLElement>(
  element: Element,
  attributeName: string,
  value: string
): Element => {
  if (hasSome(value)) {
    element.setAttribute(attributeName, value);
  } else {
    element.removeAttribute(attributeName);
  }
  return element;
};
