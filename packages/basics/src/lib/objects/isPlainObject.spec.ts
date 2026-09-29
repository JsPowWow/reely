import { isPlainObject } from './isPlainObject';

class Car {
  public lap = 0;
}

describe('isPlainObject', () => {
  test.each`
    value                              | expected
    ${{}}                              | ${true}
    ${{ lap: 1 }}                      | ${true}
    ${Object.create(null)}             | ${true}
    ${new Car()}                       | ${false}
    ${[]}                              | ${false}
    ${new Map()}                       | ${false}
    ${new Date()}                      | ${false}
    ${/lap/}                           | ${false}
    ${() => undefined}                 | ${false}
    ${null}                            | ${false}
    ${undefined}                       | ${false}
    ${'lap'}                           | ${false}
    ${1}                               | ${false}
    ${Object.create({ inherited: 1 })} | ${false}
  `('is $expected for $value', ({ value, expected }) => {
    expect(isPlainObject(value)).toBe(expected);
  });
});
