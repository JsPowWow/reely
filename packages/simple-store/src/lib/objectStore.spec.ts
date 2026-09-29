import { ObjectStore } from './objectStore';

interface Car {
  name: string;
  lap: number;
  finished: boolean;
}

const newCar = (): ObjectStore<Car> => new ObjectStore<Car>({ name: 'Red', lap: 0, finished: false });

describe('ObjectStore', () => {
  it('merges a part into a new object and notifies with it', () => {
    const car = newCar();
    const before = car.get();
    const changes: Car[] = [];
    car.on('changed', (value) => changes.push(value));

    car.set({ lap: 1 });

    expect(car.get()).toStrictEqual({ name: 'Red', lap: 1, finished: false });
    expect(car.get()).not.toBe(before);
    expect(before.lap).toBe(0);
    expect(changes).toStrictEqual([car.get()]);
    expect(changes[0]).toBe(car.get());
  });

  it('computes the part from the current value', () => {
    const car = newCar();

    car.set((current) => ({ lap: current.lap + 1 })).set((current) => ({ lap: current.lap + 1 }));

    expect(car.get().lap).toBe(2);
  });

  it('stops notifying the listener it unsubscribes, and the one taken off', () => {
    const car = newCar();
    const laps: number[] = [];
    const onChanged = (value: Car): void => {
      laps.push(value.lap);
    };
    const stop = car.on('changed', (value) => laps.push(-value.lap));
    car.on('changed', onChanged);

    car.set({ lap: 1 });
    stop();
    car.off('changed', onChanged);
    car.set({ lap: 2 });

    expect(laps).toStrictEqual([-1, 1]);
  });

  it('keeps on and off working when taken off the store', () => {
    const car = newCar();
    const { on } = car;
    const laps: number[] = [];

    const stop = on('changed', (value) => laps.push(value.lap));
    car.set({ lap: 1 });
    stop();
    car.set({ lap: 2 });

    expect(laps).toStrictEqual([1]);
  });

  it('notifies a change made by a listener after the current one reaches every listener', () => {
    const car = newCar();
    const seen: Array<[number, boolean]> = [];
    car.on('changed', (value) => {
      if (value.lap === 3 && !value.finished) {
        car.set({ finished: true });
      }
    });
    car.on('changed', (value) => seen.push([value.lap, value.finished]));

    car.set({ lap: 3 });

    expect(car.get()).toStrictEqual({ name: 'Red', lap: 3, finished: true });
    expect(seen).toStrictEqual([
      [3, false],
      [3, true],
    ]);
  });

  it('notifies several changes made during one notification once, with the latest object', () => {
    const car = newCar();
    const laps: number[] = [];
    car.on('changed', (value) => {
      if (value.lap === 1) {
        car.set({ lap: 2 }).set({ lap: 3 });
      }
    });
    car.on('changed', (value) => laps.push(value.lap));

    car.set({ lap: 1 });

    expect(laps).toStrictEqual([1, 3]);
  });

  it('notifies a change made during a notification even when a listener throws', () => {
    const car = newCar();
    const laps: number[] = [];
    const broken = new Error('broken board');
    car.on('changed', (value) => {
      if (value.lap === 1) {
        car.set({ lap: 2 });
        throw broken;
      }
    });
    car.on('changed', (value) => laps.push(value.lap));

    expect(() => car.set({ lap: 1 })).toThrow(broken);
    expect(laps).toStrictEqual([1, 2]);
  });

  it('stops listeners that keep changing the store', () => {
    const car = newCar();
    car.on('changed', (value) => car.set({ lap: value.lap + 1 }));

    expect(() => car.set({ lap: 1 })).toThrow(/keep changing the store/);
  });

  it('rejects an object that is not plain, as `set` would turn it into one', () => {
    expect(() => new ObjectStore<number[]>([1, 2])).toThrow(TypeError);
    expect(() => new ObjectStore(new Map<string, number>())).toThrow(TypeError);
  });
});

// never run: the compiler checks these calls
export function misuses(car: ObjectStore<Car>): void {
  // @ts-expect-error a car has no speed
  car.set({ speed: 1 });
  // @ts-expect-error a lap is a number
  car.set({ lap: '1' });
  // @ts-expect-error a store has only `changed`
  car.on('finished', () => undefined);
}
