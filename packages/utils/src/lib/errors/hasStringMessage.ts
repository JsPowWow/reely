import { isString } from '@reely/basics';

import { hasProperty } from '../objects/hasProperty';
import { isKeyValueObject } from '../objects/isKeyValueObject';

export type WithMessage<T> = {
  message: T;
};

export function hasStringMessage(source: unknown): source is WithMessage<string> {
  return isKeyValueObject(source) && hasProperty('message', source) && isString(source['message']);
}
