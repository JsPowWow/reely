import promiseResolver from './promiseResolver';

describe('promiseResolver', () => {
  it('settles its promise from outside the executor', async () => {
    const resolved = promiseResolver<number>();
    const rejected = promiseResolver<number>();

    resolved.resolve(7);
    rejected.reject(new RangeError('no lap 9'));

    await expect(resolved.promise).resolves.toBe(7);
    await expect(rejected.promise).rejects.toThrow(RangeError);
  });

  it('keeps the first settlement', async () => {
    const lap = promiseResolver<number>();

    lap.resolve(1);
    lap.resolve(2);
    lap.reject(new Error('late'));

    await expect(lap.promise).resolves.toBe(1);
  });
});
