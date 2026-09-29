import { isPlainObject } from '@reely/basics';

import { hasProperty } from '../objects/hasProperty';
import isString from '../objects/isString';

export type WithMessage<T> = {
  message: T;
};

export function hasStringMessage(source: unknown): source is WithMessage<string> {
  return isPlainObject(source) && hasProperty('message', source) && isString(source['message']);
}
