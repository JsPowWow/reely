import { isSomeFunction } from '@reely/basics';
import { computed, onCleanup } from '@reely/signals';
import { isInstanceOf } from '@reely/utils';

import { getDommyLogger } from '../config';
import { isSkippedChild } from './element.utils';

import type { ReactiveReelyNode, ReactiveValue, SingleReelyNode } from '../types/dommy.types';

export const bindValue = <T>(read: ReactiveValue<T>, write: (value: T) => void): void => {
  onCleanup(computed(read).subscribe(write));
};

export const applyValue = (value: unknown, write: (value: unknown) => void): void => {
  if (isSomeFunction(value)) {
    bindValue(value, write);
  } else {
    write(value);
  }
};

// A bound node renders as its string and is reported: switching nodes is `Show` or `Keyed`.
const toTextData = (value: unknown): string => {
  if (isInstanceOf(Node, value)) {
    getDommyLogger()?.warn('A bound child renders text, not a node; switch nodes with `Show` or `Keyed`:', value);
  }
  return isSkippedChild(value) ? '' : String(value);
};

export const toBoundTextNode = (read: ReactiveReelyNode): Text => {
  const text = document.createTextNode('');
  bindValue(read, (value) => {
    text.data = toTextData(value);
  });
  return text;
};

export const toChildNode = (child: SingleReelyNode): Node | string => {
  if (isSomeFunction(child)) {
    return toBoundTextNode(child);
  }
  return isInstanceOf(Node, child) ? child : toTextData(child);
};
