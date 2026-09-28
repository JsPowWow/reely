import type { PipeableFn } from '@reely/utils';
import { hasProperty, isInstanceOf, isPlainObject, isSomeFunction, isValidRecordKey } from '@reely/utils';

import { hasAriaAttribute, setAriaAttributes } from './attributes/element.aria.attributes';
import { hasStylesAttribute, setStyleAttributes } from './attributes/element.style.attributes';
import { addEventListenerHandler, isEventListenerHandler, toEventType } from './element.addListeners';
import { applyValue } from './element.bindings';
import { assignProperty } from './element.property';

import type { DOMElementFactoryOptionsProps, HtmlElementTag } from '../types/dommy.types';

const elementFactoryOptionsProps = {
  children: true,
  eventsAbortSignal: true,
  elementRef: true,
} satisfies Record<keyof Required<DOMElementFactoryOptionsProps<HtmlElementTag>>, boolean>;

export const isElementFactoryOptionProp = (
  property: unknown
): property is DOMElementFactoryOptionsProps<HtmlElementTag> => {
  return isValidRecordKey(property) && hasProperty(property, elementFactoryOptionsProps);
};

/**
 * Passes the element to `props.elementRef`: a callback ref or an object ref.
 *
 * @template Element - The type of the element.
 * @param {unknown} props - Props of the element; checked at runtime, since JSX passes them untyped.
 * @returns {PipeableFn<Element>} A step that returns the same element.
 */
export const assignElementRef =
  <Element extends HTMLElement>(props: unknown): PipeableFn<Element> =>
  (element: Element) => {
    if (hasProperty('elementRef', props)) {
      const { elementRef } = props;
      if (isSomeFunction(elementRef)) {
        elementRef(element);
      } else if (hasProperty('current', elementRef)) {
        elementRef.current = element;
      }
    }
    return element;
  };

/**
 * Applies props to the element: styles, ARIA, event listeners, attributes and live properties;
 * a signal or a getter keeps its prop updated.
 *
 * @template Element - The type of the element.
 * @param {unknown} props - Props of the element; checked at runtime, since JSX passes them untyped.
 * @returns {PipeableFn<Element>} A step that returns the same element.
 */
export const assignProperties =
  <Element extends HTMLElement>(props: unknown): PipeableFn<Element> =>
  (element: Element) => {
    if (!isPlainObject(props)) {
      return element;
    }

    if (hasStylesAttribute(props)) {
      setStyleAttributes(element, props.styles);
    }

    if (hasAriaAttribute(props)) {
      setAriaAttributes(element, props.aria);
    }

    const { styles: _ignoredStyles, aria: _ignoredAria, children: _ignoredChildren, ...restProps } = props;
    const eventsAbortSignal = isInstanceOf(AbortSignal, restProps['eventsAbortSignal'])
      ? restProps['eventsAbortSignal']
      : undefined;

    for (const [property, value] of Object.entries(restProps)) {
      switch (true) {
        case isElementFactoryOptionProp(property): {
          break;
        }
        case isEventListenerHandler(property, value): {
          addEventListenerHandler(element, toEventType(property), value, eventsAbortSignal);
          break;
        }
        default: {
          applyValue(value, (current) => assignProperty(element, property, current));
        }
      }
    }
    return element;
  };
