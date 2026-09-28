import type { Nullable, PipeableFn } from '@reely/utils';
import { hasProperty, isInstanceOf, isNil, isPrimitiveValue, isSomeFunction, isValidRecordKey } from '@reely/utils';

import { hasAriaAttribute, setAriaAttributes } from './attributes/element.aria.attributes';
import { hasStylesAttribute, setStyleAttributes } from './attributes/element.style.attributes';
import { addEventListenerHandler, isEventListenerHandler, toEventType } from './element.addListeners';
import { applyValue } from './element.bindings';
import { assignProperty } from './element.property';

import type {
  DOMElement,
  DOMElementFactoryOptionsProps,
  DOMElementFactoryProps,
  HtmlElementTag,
} from '../types/dommy.types';

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

export const assignElementRef =
  <Tag extends HtmlElementTag, Element extends DOMElement<Tag> = DOMElement<Tag>>(
    props: Nullable<DOMElementFactoryProps<Tag>>
  ): PipeableFn<Element> =>
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

export const assignProperties =
  <Tag extends HtmlElementTag, Element extends DOMElement<Tag> = DOMElement<Tag>>(
    props: Nullable<DOMElementFactoryProps<Tag>>
  ): PipeableFn<Element> =>
  (element: Element) => {
    if (isNil(props) || isPrimitiveValue(props) || isInstanceOf(Node, props) || isSomeFunction(props)) {
      return element;
    }

    if (hasStylesAttribute(props)) {
      setStyleAttributes(element, props.styles);
    }

    if (hasAriaAttribute(props)) {
      setAriaAttributes(element, props.aria);
    }

    const { styles: _ignoredStyles, aria: _ignoredAria, children: _ignoredChildren, ...restProps } = props;

    for (const [property, value] of Object.entries(restProps)) {
      switch (true) {
        case isElementFactoryOptionProp(property): {
          break;
        }
        case isEventListenerHandler(property, value): {
          addEventListenerHandler(element, toEventType(property), value, restProps.eventsAbortSignal);
          break;
        }
        default: {
          applyValue(value, (current) => assignProperty(element, property, current));
        }
      }
    }
    return element;
  };
