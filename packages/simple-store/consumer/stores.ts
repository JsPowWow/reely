import { ObjectStore, PrimitiveStore } from '@reely/simple-store';
import type { StoreEvents } from '@reely/simple-store';

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
