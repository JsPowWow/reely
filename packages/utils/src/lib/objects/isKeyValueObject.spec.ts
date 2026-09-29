import { isKeyValueObject } from './isKeyValueObject';

describe('isKeyValueObject', () => {
  it('takes object literals, objects without a prototype and class instances', () => {
    class Lap {
      public number = 1;
    }

    expect(isKeyValueObject({ lap: 1 })).toBe(true);
    expect(isKeyValueObject(Object.create(null))).toBe(true);
    expect(isKeyValueObject(new Lap())).toBe(true);
  });

  it('rejects nil, primitives, arrays, functions and built-in objects', () => {
    for (const value of [null, undefined, 1, 'lap', true, [1], () => 1, new Date(), new Map(), /lap/]) {
      expect(isKeyValueObject(value)).toBe(false);
    }
  });
});
