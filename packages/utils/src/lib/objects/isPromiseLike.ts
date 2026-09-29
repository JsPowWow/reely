import { hasSome , isSomeFunction } from '@reely/basics';

import { hasProperty } from './hasProperty';

export default function isPromiseLike<T>(source: unknown): source is PromiseLike<T> {
  return hasSome(source) && hasProperty('then', source) && isSomeFunction(source['then']);
}
