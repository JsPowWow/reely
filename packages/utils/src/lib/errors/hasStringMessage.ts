import { hasProperty } from '../objects/hasProperty';
import { isKeyValueObject } from '../objects/isKeyValueObject';
import isString from '../objects/isString';

export type WithMessage<T> = {
  message: T;
};

export function hasStringMessage(source: unknown): source is WithMessage<string> {
  return isKeyValueObject(source) && hasProperty('message', source) && isString(source['message']);
}
