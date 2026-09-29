import { hasSome } from './hasSome';

const noop = (): void => undefined;

const notDefined = undefined;

describe('hasSome tests', () => {
  it('inspect available functionality', () => {
    expect(hasSome(null)).toBe(false);
    expect(hasSome(notDefined)).toBe(false);
    expect(hasSome('')).toBe(true);
    expect(hasSome(noop)).toBe(true);
    expect(hasSome(noop())).toBe(false);
  });

  describe('hasSome', () => {
    test.each`
      value             | expected
      ${undefined}      | ${false}
      ${null}           | ${false}
      ${['foo', 'bar']} | ${true}
      ${{ foo: 'bar' }} | ${true}
      ${10}             | ${true}
      ${''}             | ${true}
      ${'phrase'}       | ${true}
    `('"$value" -> $expected', ({ value, expected }) => {
      expect(hasSome(value)).toStrictEqual(expected);
    });
  });

  it('narrows away null and undefined, and nothing else', () => {
    const laps = new Set([1]) as Set<number> | undefined;
    const value: unknown = { lap: 1 };

    if (hasSome(laps)) {
      expectTypeOf(laps).toEqualTypeOf<Set<number>>();
    }
    // @ts-expect-error the type comes from the value, a type argument cannot cast it
    expect(hasSome<{ lap: number }>(value)).toBe(true);
  });
});
