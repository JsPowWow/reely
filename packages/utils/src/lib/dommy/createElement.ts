import { Maybe } from '../fp/maybe/Maybe';
import { pipe } from '../fp/pipe';
import { isNonEmpty } from '../objects/isNonEmpty';
import { assignProperties } from './helpers/element.assign.properties';
import { appendChildren } from './utils/element.children';

import type { DOMNode, DOMElementFactoryProps, DOMElement, HtmlElementTag } from './types/hyperscript.types';
import type { Nullable } from '../types/core.types';

export const createElement = <Tag extends HtmlElementTag>(
  tag: Tag,
  props?: Nullable<DOMElementFactoryProps<Tag>>,
  ...children: DOMNode[]
): DOMElement<Tag> =>
  pipe(
    document.createElement(tag),
    assignProperties(props),
    appendChildren(
      isNonEmpty(children)
        ? children
        : Maybe.from(props)
            .map(({ children }) => (Array.isArray(children) ? children : [children]))
            .getOrDefault([])
    )
  );
