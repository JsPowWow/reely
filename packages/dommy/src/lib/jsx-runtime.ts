import type { Nil, Nullable, PrimitiveValue } from '@reely/utils';
import { isNonEmpty, isSomeFunction } from '@reely/utils';

import { createElement } from './createElement';

import type { ChildDOMElement, DOMElementFactoryProps, HtmlElementTag } from './types/dommy.types';

type GlobalDOMElement = globalThis.Element;

type FunctionalComponent = <T extends object>(
  props: T & { children?: ChildDOMElement }
) => Element | FunctionalComponent;

declare global {
  namespace JSX {
    type IntrinsicElements = Record<HtmlElementTag, DOMElementFactoryProps<HtmlElementTag>>;
    interface IntrinsicAttributes {
      key?: PropertyKey;
    }
    type Element = Node | GlobalDOMElement | HTMLElement | PrimitiveValue | Nil; // | JSX.Element[];
  }
}

export const jsx = createJsxElement;

function createJsxElement(
  component: HtmlElementTag | FunctionalComponent,
  props: Nullable<DOMElementFactoryProps<HtmlElementTag>>,
  ...children: ChildDOMElement[]
): Element | FunctionalComponent {
  if (isSomeFunction(component)) {
    return component(Object.assign({}, props, isNonEmpty(children) ? { children: children } : undefined));
  }

  return createElement(component, props, ...children);
}
