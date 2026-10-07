import { isBoolean } from './isBoolean';

describe('isBoolean', () => {
  // eslint-disable-next-line sonarjs/no-primitive-wrappers -- a boxed boolean is the case under test
  const boxed = new Boolean(true);

  test.each`
    value        | expected
    ${true}      | ${true}
    ${false}     | ${true}
    ${boxed}     | ${false}
    ${'true'}    | ${false}
    ${0}         | ${false}
    ${undefined} | ${false}
    ${null}      | ${false}
  `('"$value" -> $expected', ({ value, expected }) => {
    expect(isBoolean(value)).toStrictEqual(expected);
  });

  it('narrows a union to its booleans', () => {
    const saved = JSON.parse('{"sound":false}').sound as boolean | string;

    if (isBoolean(saved)) {
      expectTypeOf(saved).toEqualTypeOf<boolean>();
    }
  });
});
