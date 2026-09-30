import { isSomeFunction } from '@reely/basics';
import type { Nil } from '@reely/utils';
import { isInstanceOf, isNil, isPrimitiveValue } from '@reely/utils';

import type { SingleReelyNode } from '../types/dommy.types';

// `null`, `undefined` and `false` render nothing; `0` and `''` do render
export const isSkippedChild = (child: unknown): child is Nil | false => isNil(child) || child === false;

export const isValidChildDOMNode = (child: unknown): child is SingleReelyNode =>
  isInstanceOf(Node, child) || isPrimitiveValue(child) || isSomeFunction(child);

export const isValidRenderableChildDOMNode = (child: unknown): child is SingleReelyNode =>
  isValidChildDOMNode(child) && !isSkippedChild(child);

export const toValidChildDOMElement = (maybeChildren: readonly unknown[]): SingleReelyNode[] =>
  maybeChildren.flat(Infinity).filter(isValidRenderableChildDOMNode);
