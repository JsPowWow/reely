import type { Bivariant } from './function.types';

describe('Bivariant', () => {
  it('takes a function with a narrower parameter, which a plain function type rejects', () => {
    const lap = (value: number): number => value;

    const vouched: Bivariant<(value: unknown) => unknown> = lap;
    // @ts-expect-error a plain function type checks its parameters
    const checked: (value: unknown) => unknown = lap;

    expect([vouched(1), checked(2)]).toStrictEqual([1, 2]);
  });

  it('still rejects a function whose parameter is unrelated', () => {
    const name = (value: string): string => value;

    // @ts-expect-error `string` and `number` are unrelated both ways
    const vouched: Bivariant<(value: number) => unknown> = name;

    expect(vouched).toBe(name);
  });
});
