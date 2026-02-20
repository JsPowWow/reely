import type { Nullable } from '@reely/utils';
import { pipe } from '@reely/utils';

import { appendChildren, normalizeChildrenProps } from './utils/element.children';
import { assignElementRef, assignProperties } from './utils/element.properties';

import type { ChildDOMElement, DOMElement, DOMElementFactoryProps, HtmlElementTag } from './types/dommy.types';

export const createElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOMElement[]
): DOMElement<Tag> => {
  const [elementProps, elementChildren] = normalizeChildrenProps(props, children);
  const newElement = document.createElement(tag);
  return pipe(
    newElement,
    assignElementRef(elementProps), // TODO AR expose ref on last phase ?
    assignProperties(elementProps),
    appendChildren(elementChildren)
  );
};
