import type { PipeableFn } from '@reely/utils';
import { hasProperty, isInstanceOf, isPlainObject, isSomeFunction, isValidRecordKey } from '@reely/utils';

import { hasAriaAttribute, setAriaAttributes } from './attributes/element.aria.attributes';
import { isLiveProperty } from './attributes/element.live.properties';
import { hasStylesAttribute, setStyleAttributes } from './attributes/element.style.attributes';
import { addEventListenerHandler, isEventListenerHandler, toEventType } from './element.addListeners';
import { applyValue } from './element.bindings';
import { assignProperty } from './element.property';

import type { DOMElementFactoryOptionsProps, HtmlElementTag, DommyElement } from '../types/dommy.types';

const elementFactoryOptionsProps = {
  key: true,
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
 * @param {unknown} maybeProps - Props of the element; checked at runtime, since JSX passes them untyped.
 * @returns {PipeableFn<Element>} A step that returns the same element.
 */
export const assignElementRef =
  <Element extends DommyElement>(maybeProps: unknown): PipeableFn<Element> =>
  (element: Element) => {
    if (hasProperty('elementRef', maybeProps)) {
      const { elementRef } = maybeProps;
      if (isSomeFunction(elementRef)) {
        elementRef(element);
      } else if (hasProperty('current', elementRef)) {
        elementRef.current = element;
      }
    }
    return element;
  };

/**
 * Applies props to the element: styles, ARIA, event listeners and attributes; a signal or a
 * getter keeps its prop updated. Live state (`value`, `checked`…) waits for
 * `assignLiveProperties`, after the children.
 *
 * @template Element - The type of the element.
 * @param {unknown} maybeProps - Props of the element; checked at runtime, since JSX passes them untyped.
 * @returns {PipeableFn<Element>} A step that returns the same element.
 */
export const assignProperties =
  <Element extends DommyElement>(maybeProps: unknown): PipeableFn<Element> =>
  (element: Element) => {
    if (!isPlainObject(maybeProps)) {
      return element;
    }

    if (hasStylesAttribute(maybeProps)) {
      setStyleAttributes(element, maybeProps.styles);
    }

    if (hasAriaAttribute(maybeProps)) {
      setAriaAttributes(element, maybeProps.aria);
    }

    const { styles: _ignoredStyles, aria: _ignoredAria, children: _ignoredChildren, ...restProps } = maybeProps;
    const { eventsAbortSignal: maybeSignal } = restProps;
    const eventsAbortSignal = isInstanceOf(AbortSignal, maybeSignal) ? maybeSignal : undefined;

    for (const [property, value] of Object.entries(restProps)) {
      switch (true) {
        case isElementFactoryOptionProp(property):
        case isLiveProperty(property): {
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

/**
 * Applies the live state props (`value`, `checked`, `selected`…) once the children are in:
 * a `select` value then finds the option it names, and `multiple`, an attribute, is already set.
 *
 * @template Element - The type of the element.
 * @param {unknown} maybeProps - Props of the element; checked at runtime, since JSX passes them untyped.
 * @returns {PipeableFn<Element>} A step that returns the same element.
 */
export const assignLiveProperties =
  <Element extends DommyElement>(maybeProps: unknown): PipeableFn<Element> =>
  (element: Element) => {
    if (isPlainObject(maybeProps)) {
      for (const [property, value] of Object.entries(maybeProps)) {
        if (isLiveProperty(property)) {
          applyValue(value, (current) => assignProperty(element, property, current));
        }
      }
    }
    return element;
  };
