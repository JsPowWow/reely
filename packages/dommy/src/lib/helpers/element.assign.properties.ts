import type { Nullable, PipeableFunction } from '@reely/utils';
import { hasProperty, isNil, isSomeFunction, isValidRecordKey } from '@reely/utils';

import { getDommyLogger } from '../config';
import { hasAriaAttribute, setAriaAttributes } from '../utils/attributes/element.aria.attributes';
import { isSafeAttributeEntry, setAttribute } from '../utils/attributes/element.attributes';
import { isBooleanAttribute, setBoolAttribute } from '../utils/attributes/element.bool.attributes';
import { isDataAttribute, setDataAttribute } from '../utils/attributes/element.data.attributes';
import { isMappedAttribute, setMappedAttribute } from '../utils/attributes/element.mapped.attributes';
import { hasStylesAttribute, setStyleAttributes } from '../utils/attributes/element.style.attributes';
import { addEventListenerHandler, isEventListenerHandler } from '../utils/element.addListeners';

import type {
  DOMElement,
  DOMElementFactoryOptionsProps,
  DOMElementFactoryProps,
  HtmlElementTag,
} from '../types/hyperscript.types';

const elementFactoryOptionsProps = {
  children: true,
  eventsAbortSignal: true,
  elementRef: true,
} satisfies Record<keyof Required<DOMElementFactoryOptionsProps<HtmlElementTag>>, boolean>;

const dommyLogger = getDommyLogger();

export const isElementFactoryOptionProp = (
  property: unknown
): property is DOMElementFactoryOptionsProps<HtmlElementTag> => {
  return isValidRecordKey(property) && hasProperty(property, elementFactoryOptionsProps);
};

export const assignElementRef =
  <Tag extends HtmlElementTag, Element extends DOMElement<Tag> = DOMElement<Tag>>(
    props: Nullable<DOMElementFactoryProps<Tag>>
  ): PipeableFunction<Element> =>
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
  ): PipeableFunction<Element> =>
  (element: Element) => {
    if (isNil(props)) {
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
        case isEventListenerHandler(value): {
          addEventListenerHandler(element, property, value, restProps.eventsAbortSignal);
          break;
        }
        case isBooleanAttribute(property): {
          setBoolAttribute(element, property, Boolean(value));
          break;
        }
        case isDataAttribute(property): {
          setDataAttribute(element, property, String(value));
          break;
        }
        case isMappedAttribute(property): {
          setMappedAttribute(element, property, String(value));
          break;
        }
        case isSafeAttributeEntry(property, value): {
          setAttribute(element, property, String(value));
          break;
        }
        default: {
          dommyLogger?.warn('The create element option was not proceed: ', property, value);
        }
      }
    }
    return element;
  };
