import { isTruthy } from './isTruthy';

describe('isTruthy', () => {
  test.each([false, 0, -0, 0n, '', null, undefined, Number.NaN])('rejects %s', (value) => {
    expect(isTruthy(value)).toBe(false);
  });

  test.each([true, 1, -1, 1n, 'Ada', [], {}, () => undefined])('accepts %s', (value) => {
    expect(isTruthy(value)).toBe(true);
  });

  it('narrows away the falsy members of a union', () => {
    const waiting: { attempt: string } | null | false = { attempt: 'lap 3' };

    const attempt = isTruthy(waiting) ? waiting.attempt : 'none';

    expect(attempt).toBe('lap 3');
  });
});
