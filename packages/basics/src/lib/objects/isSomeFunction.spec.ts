import { isSomeFunction } from './isSomeFunction';

const normalFunction = function (): void {
  /** this is intentional */
};

const arrowFunction = function (): void {
  /** this is intentional */
};

const clz = class test extends Object {
  public foo(): void {
    /** this is intentional */
  }
};

describe('isFunction', () => {
  test.each`
    value             | expected
    ${undefined}      | ${false}
    ${null}           | ${false}
    ${'phrase'}       | ${false}
    ${''}             | ${false}
    ${['foo', 'bar']} | ${false}
    ${{ foo: 'bar' }} | ${false}
    ${10}             | ${false}
    ${normalFunction} | ${true}
    ${arrowFunction}  | ${true}
    ${clz}            | ${true}
  `('"$value" -> $expected', ({ value, expected }) => {
    expect(isSomeFunction(value)).toStrictEqual(expected);
  });

  it('narrows a union to its functions', () => {
    const listener = ((lap: number): number => lap) as ((lap: number) => number) | string;

    if (isSomeFunction(listener)) {
      expectTypeOf(listener).toEqualTypeOf<(lap: number) => number>();
    }
  });

  it('never casts an unknown value to a function with a signature', () => {
    const value: unknown = (lap: number): number => lap;

    if (isSomeFunction(value)) {
      // @ts-expect-error what the function takes is unknown
      expect(value(1)).toBe(1);
    }
    // @ts-expect-error the type comes from the value, a type argument cannot cast it
    expect(isSomeFunction<(lap: number) => number>(value)).toBe(true);
  });
});
