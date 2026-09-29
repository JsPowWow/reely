import { assertIsNonNullable } from './assertIsNonNullable';

describe('assertIsNonNullable', () => {
  it('passes a value that is not null or undefined, falsy ones included', () => {
    expect(() => [0, '', false, Number.NaN].forEach((value) => assertIsNonNullable(value))).not.toThrow();
  });

  it('throws for null and undefined, with the messages given', () => {
    expect(() => assertIsNonNullable(null, 'the queue', 'has no task')).toThrow(
      'Nullish assertion Error: "null"; the queue has no task'
    );
    expect(() => assertIsNonNullable(undefined)).toThrow('Nullish assertion Error: "undefined"');
  });

  it('narrows the value for the code after it', () => {
    const lap: number | undefined = [3].at(0);

    assertIsNonNullable(lap);

    expectTypeOf(lap).toEqualTypeOf<number>();
  });
});
