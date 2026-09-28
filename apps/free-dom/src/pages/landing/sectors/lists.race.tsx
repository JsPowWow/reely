import { For, signal } from '@reely/dommy';

import css from './sectors.module.css';

interface Car {
  id: string;
  distance: number;
}

const startingGrid: readonly Car[] = ['3', '7', '1', '5', '4'].map((id) => ({ id, distance: 0 }));
const pace = (car: Car, lap: number): number => 400 + ((Number(car.id) * 37 + lap * 13) % 97);

// `For` keeps one row per car; after a lap only the rows that changed places move.
export const Race = (): Node => {
  const lap = signal(0);
  const cars = signal(startingGrid);
  const raceLap = (): void => {
    lap.value += 1;
    cars.value = cars.value
      .map((car) => ({ ...car, distance: car.distance + pace(car, lap.value) }))
      .toSorted((a, b) => b.distance - a.distance);
  };

  return (
    <div className={css.stack}>
      <ol className={css.grid}>
        <For each={cars} by={(car) => car.id}>
          {(car, index) => (
            <li className={css.row}>
              <span className={css.place}>{() => index() + 1}</span>
              <span className={css.name}>Car {() => car().id}</span>
              <span className={css.time}>{() => `${car().distance} m`}</span>
            </li>
          )}
        </For>
      </ol>
      <div className={css.counter}>
        <button onClick={raceLap}>Race a lap</button>
        <p className={css.note}>Lap {lap}</p>
      </div>
    </div>
  );
};
