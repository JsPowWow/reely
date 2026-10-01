import { ValueStore } from './valueStore';

describe('ValueStore', () => {
  it('holds a value and notifies when a different one is set', () => {
    const lap = new ValueStore(0);
    const changes: number[] = [];
    lap.on('changed', (value) => changes.push(value));

    lap.value = 1;
    lap.value = 1;
    lap.value = 2;

    expect(lap.value).toBe(2);
    expect(changes).toStrictEqual([1, 2]);
  });

  it('compares values as Object.is does', () => {
    const gap = new ValueStore(Number.NaN);
    const changes: number[] = [];
    gap.on('changed', (value) => changes.push(value));

    gap.value = Number.NaN;
    gap.value = 0;
    gap.value = -0;

    expect(changes).toStrictEqual([0, -0]);
  });

  it('stops notifying the listener it unsubscribes, and the one taken off', () => {
    const lap = new ValueStore(0);
    const changes: number[] = [];
    const onChanged = (value: number): void => {
      changes.push(value);
    };
    const stop = lap.on('changed', (value) => changes.push(-value));
    lap.on('changed', onChanged);

    lap.value = 1;
    stop();
    lap.off('changed', onChanged);
    lap.value = 2;

    expect(changes).toStrictEqual([-1, 1]);
  });

  it('keeps on and off working when taken off the store', () => {
    const lap = new ValueStore(0);
    const { on } = lap;
    const changes: number[] = [];

    const stop = on('changed', (value) => changes.push(value));
    lap.value = 1;
    stop();
    lap.value = 2;

    expect(changes).toStrictEqual([1]);
  });

  it('notifies a value set by a listener after the current one reaches every listener', () => {
    const lap = new ValueStore(0);
    const seen: number[] = [];
    lap.on('changed', (value) => {
      if (value === 1) {
        lap.value = 2;
      }
    });
    lap.on('changed', (value) => seen.push(value));

    lap.value = 1;

    expect(seen).toStrictEqual([1, 2]);
  });

  it('stops listeners that keep changing the store', () => {
    const lap = new ValueStore(0);
    lap.on('changed', (value) => {
      lap.value = value + 1;
    });

    expect(() => {
      lap.value = 1;
    }).toThrow(/keep changing the store/);
  });

  it('keeps the errors of the listeners when it stops them', () => {
    const lap = new ValueStore(0);
    const broken = new Error('broken sensor');
    lap.on('changed', (value) => {
      if (value === 1) {
        throw broken;
      }
    });
    lap.on('changed', (value) => {
      lap.value = value + 1;
    });

    expect(() => {
      lap.value = 1;
    }).toThrow(
      expect.objectContaining({
        errors: [broken, expect.objectContaining({ message: expect.stringMatching(/keep changing/) })],
      })
    );
  });
});

// never run: the compiler checks these calls
export function misuses(lap: ValueStore<number>, laps: ValueStore<number[]>): void {
  // @ts-expect-error a change goes through the store, which then notifies
  laps.value.push(1);
  // @ts-expect-error a lap is a number
  lap.value = '1';
  // @ts-expect-error a store has only `changed`
  lap.on('finished', () => undefined);
}
