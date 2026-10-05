import { isNonEmpty } from './isNonEmpty';

describe('isNonEmpty', () => {
  it.each([
    { value: 'a', expected: true },
    { value: [0], expected: true },
    { value: '', expected: false },
    { value: [], expected: false },
    { value: null, expected: false },
    { value: undefined, expected: false },
  ])('tells $value: $expected', ({ value, expected }) => {
    expect(isNonEmpty(value)).toBe(expected);
  });

  it('takes a readonly array', () => {
    const faces: readonly string[] = ['dommy'];

    expect(isNonEmpty(faces)).toBe(true);
  });
});
