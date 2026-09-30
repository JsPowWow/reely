import { isString } from '@reely/basics';

import isNil from './isNil';
import isNumber from './isNumber';

type ObjectsKeyMap = {
  getKeyOf: (source: object) => string;
  /** One `Map` key for a set of objects: order and repeats do not change it. */
  compositeKey: (...keys: object[]) => string;
};

export default function objectsKeyMap(): ObjectsKeyMap {
  const ids = new WeakMap<object, bigint>();
  let nextId = 1n;

  const getBitMask = (o: object): bigint => {
    let id = ids.get(o);
    if (id === undefined) {
      id = nextId++;
      ids.set(o, id);
    }
    return 1n << id;
  };

  return {
    getKeyOf: (source: object): string => {
      if (isNil(source) || isString(source) || isNumber(source)) {
        return String(source);
      }
      return getBitMask(source).toString(10);
    },
    compositeKey: (...keys: object[]): string => keys.reduce((k, o) => k | getBitMask(o), 0n).toString(10),
  };
}
