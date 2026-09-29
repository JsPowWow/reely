import { forEachSettled } from './forEachSettled';

describe('forEachSettled', () => {
  it('calls the callback for every item, in order', () => {
    const seen: number[] = [];

    forEachSettled([1, 2, 3], (item) => seen.push(item));

    expect(seen).toStrictEqual([1, 2, 3]);
  });

  it('calls every item even when one throws, then throws that error as is', () => {
    const seen: number[] = [];
    const broken = new Error('broken connection');

    expect(() =>
      forEachSettled([1, 2, 3], (item) => {
        if (item === 1) {
          throw broken;
        }
        seen.push(item);
      })
    ).toThrow(broken);
    expect(seen).toStrictEqual([2, 3]);
  });

  it('throws every error together, with the message, when several calls threw', () => {
    const first = new Error('first');
    const second = new Error('second');

    const settle = (): void =>
      forEachSettled(
        [first, second],
        (error) => {
          throw error;
        },
        'connections failed to close'
      );

    expect(settle).toThrow(AggregateError);
    expect(settle).toThrow(
      expect.objectContaining({ errors: [first, second], message: 'connections failed to close' })
    );
  });

  it('says how many calls threw when no message is given', () => {
    expect(() =>
      forEachSettled([1, 2], () => {
        throw new Error('broken');
      })
    ).toThrow('2 calls threw');
  });

  it('takes any iterable, a generator included', () => {
    function* laps(): Generator<number> {
      yield 1;
      yield 2;
    }
    const seen: number[] = [];

    forEachSettled(new Set(['a', 'b']), (item) => seen.push(item.length));
    forEachSettled(laps(), (lap) => seen.push(lap));

    expect(seen).toStrictEqual([1, 1, 1, 2]);
  });

  it('keeps the errors of the calls made before the items themselves threw, that error last', () => {
    const broken = new Error('broken');
    const exhausted = new Error('no more laps');
    function* laps(): Generator<number> {
      yield 1;
      throw exhausted;
    }

    expect(() =>
      forEachSettled(laps(), () => {
        throw broken;
      })
    ).toThrow(expect.objectContaining({ errors: [broken, exhausted] }));
  });
});
