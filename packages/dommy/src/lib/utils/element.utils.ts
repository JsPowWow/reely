import type { Nil } from '@reely/utils';
import { isInstanceOf, isNil, isPrimitiveValue, isSomeFunction } from '@reely/utils';

import type { SingleReelyNode } from '../types/dommy.types';

export const isFalsyElement = (element: unknown): element is Nil | false => isNil(element) || element === false;

export const isValidChildDOMNode = (child: unknown): child is SingleReelyNode =>
  isInstanceOf(Node, child) || isPrimitiveValue(child) || isSomeFunction(child);

export const isValidRenderableChildDOMNode = (child: unknown): child is SingleReelyNode =>
  isValidChildDOMNode(child) && !isFalsyElement(child);

export const toValidChildDOMElement = (maybeChildren: readonly unknown[]): SingleReelyNode[] =>
  maybeChildren.flat(Infinity).filter(isValidRenderableChildDOMNode);
