import { hasSome , isSomeFunction } from '@reely/basics';

import { hasProperty } from './hasProperty';

export default function isPromise<T>(source: unknown): source is Promise<T> {
  return (
    hasSome(source) &&
    hasProperty('then', source) &&
    isSomeFunction(source['then']) &&
    hasProperty('catch', source) &&
    isSomeFunction(source['catch']) &&
    hasProperty('finally', source) &&
    isSomeFunction(source['finally'])
  );
}
