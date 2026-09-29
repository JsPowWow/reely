import { ObjectStore, PrimitiveStore } from '@reely/simple-store';
import type { StoreEvents, StoreSelection } from '@reely/simple-store';

interface Car {
  name: string;
  lap: number;
}

const car = new ObjectStore<Car>({ name: 'Red', lap: 0 });
const lap = new PrimitiveStore(0);
const seen: Array<StoreEvents<Car>['changed']> = [];
const stop = car.on('changed', (value) => seen.push(value));
lap.on('changed', (value) => car.set({ lap: value }));

lap.value = 1;
stop();
lap.value = 2;

if (seen.length !== 1 || seen[0]?.lap !== 1 || car.get().lap !== 2) {
  throw new Error(`unexpected store values: ${JSON.stringify({ seen, car: car.get() })}`);
}

const leaderLap: StoreSelection<number> = car.select((value) => value.lap);
const leaderLaps: number[] = [];
leaderLap.on('changed', (value) => leaderLaps.push(value));
car.set({ name: 'Blue' }).set({ lap: 3 });

if (leaderLaps.join() !== '3' || leaderLap.value !== 3) {
  throw new Error(`unexpected selection: ${leaderLaps.join()}`);
}
