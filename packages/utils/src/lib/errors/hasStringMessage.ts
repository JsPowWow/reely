import hasProperty from '../objects/hasProperty';
import isPlainObject from '../objects/isPlainObject';
import isString from '../objects/isString';

export type WithMessage<T> = {
  message: T;
};

export function hasStringMessage(source: unknown): source is WithMessage<string> {
  return isPlainObject(source) && hasProperty('message', source) && isString(source['message']);
}
