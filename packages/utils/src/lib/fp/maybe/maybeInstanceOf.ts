import { Maybe } from './Maybe';
import isInstanceOf from '../../objects/isInstanceOf';

import type { ConstructorOf } from '../../types/utility.types';

export default function maybeInstanceOf<T>(elementType: ConstructorOf<T>) {
  return function (value: unknown): Maybe<T> {
    if (isInstanceOf(elementType, value)) {
      return Maybe.from(value);
    }
    return Maybe.none();
  };
}
