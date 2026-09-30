import { isString } from '@reely/basics';
import type { PipeableFn } from '@reely/utils';
import { hasProperty, isInstanceOf, isNonEmpty } from '@reely/utils';

import { toChildNode } from './element.bindings';
import { toValidChildDOMElement } from './element.utils';

import type { DommyElement, ReelyNode, SingleReelyNode } from '../types/dommy.types';

/** A `pipe` step that appends already validated children. */
export const appendChildren =
  <Element extends DommyElement>(children: SingleReelyNode[]): PipeableFn<Element> =>
  (parent) => {
    parent.append(...children.map(toChildNode));
    return parent;
  };

/** Appends a child, arrays nested as JSX produces them; `null`, `undefined` and `false` render nothing. */
export const appendTo =
  <Element extends DommyElement>(parent: Element): ((child: ReelyNode) => Element) =>
  (child) => {
    parent.append(...toChildNodes([child]));
    return parent;
  };

/** Replaces all children of `parent`; takes the same children as `appendTo`. */
export const replaceChildrenOf =
  <Element extends DommyElement>(parent: Element): ((...children: ReelyNode[]) => Element) =>
  (...children) => {
    parent.replaceChildren(...toChildNodes(children));
    return parent;
  };

export const toChildNodes = (maybeChildren: readonly unknown[]): (Node | string)[] =>
  toValidChildDOMElement(maybeChildren).map(toChildNode);

// A fragment for anything that is not a node, so a component may return text, a getter, a list or nothing.
export const toNode = (child: ReelyNode): Node => {
  if (isInstanceOf(Node, child)) {
    return child;
  }
  const fragment = document.createDocumentFragment();
  fragment.append(...toChildNodes([child]));
  return fragment;
};

// A fragment gives its children and a string a text node, so each node can be moved or removed on its own.
export const toNodes = (maybeChild: unknown): Node[] =>
  toChildNodes([maybeChild]).flatMap((child) => {
    if (isString(child)) {
      return [document.createTextNode(child)];
    }
    return isInstanceOf(DocumentFragment, child) ? Array.from(child.childNodes) : [child];
  });

export const toElementChildren = (maybeProps: unknown, maybeChildren: readonly unknown[]): SingleReelyNode[] => {
  const elementChildren = toValidChildDOMElement(maybeChildren);
  if (isNonEmpty(elementChildren) || !hasProperty('children', maybeProps)) {
    return elementChildren;
  }
  return toValidChildDOMElement([maybeProps.children]);
};
