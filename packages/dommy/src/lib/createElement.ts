import type { Nullable } from '@reely/utils';
import { isNonEmpty, Maybe, pipe } from '@reely/utils';

import { assignElementRef, assignProperties } from './helpers/element.assign.properties';
import { appendChildren } from './utils/element.children';

import type { ChildDOM, DOMElement, DOMElementFactoryProps, HtmlElementTag } from './types/dommy.types';

export const createElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: ChildDOM[]
): DOMElement<Tag> => {
  const elementChildren = children.flat();

  return pipe(
    document.createElement(tag),
    assignElementRef(props),
    assignProperties(props),
    appendChildren(
      isNonEmpty(elementChildren)
        ? elementChildren
        : Maybe.from(props)
            .map(({ children }) => (Array.isArray(children) ? children : [children]))
            .getOrDefault([])
    )
  );
};
