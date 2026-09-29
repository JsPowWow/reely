import { hasProperty, hasSome, isNil } from '@reely/utils';

import { applyValue } from '../element.bindings';

import type { DOMElementStyles } from '../../types/attributes.types';
import type { DommyElement } from '../../types/dommy.types';

export const hasStylesAttribute = <T>(props: T): props is T & { styles: DOMElementStyles } => {
  return hasProperty('styles', props) && hasSome(props.styles);
};

const setStyle = (style: CSSStyleDeclaration, name: string, value: unknown): void => {
  const cssValue = isNil(value) ? '' : String(value);
  if (name.startsWith('--')) {
    style.setProperty(name, cssValue);
  } else {
    Reflect.set(style, name, cssValue);
  }
};

/** Applies inline styles; a signal or a getter keeps its style updated. */
export const setStyleAttributes = <Element extends DommyElement>(
  element: Element,
  styles: DOMElementStyles
): Element => {
  for (const [name, value] of Object.entries(styles)) {
    applyValue(value, (current) => setStyle(element.style, name, current));
  }
  return element;
};
