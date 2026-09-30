import { isString } from './isString';

describe('isString', () => {
  test.each`
    value                      | expected
    ${'phrase'}                | ${true}
    ${''}                      | ${true}
    ${new String('boxed')}     | ${false}
    ${undefined}               | ${false}
    ${null}                    | ${false}
    ${10}                      | ${false}
    ${['a']}                   | ${false}
    ${{ toString: () => 'a' }} | ${false}
  `('"$value" -> $expected', ({ value, expected }) => {
    expect(isString(value)).toStrictEqual(expected);
  });

  it('narrows a union to its strings', () => {
    const title = 'Q3 report' as string | number | null;

    if (isString(title)) {
      expectTypeOf(title).toEqualTypeOf<string>();
    }
  });
});
