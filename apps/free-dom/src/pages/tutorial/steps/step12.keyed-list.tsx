import type { JSX } from '@reely/dommy';
import { batch, For, signal } from '@reely/dommy';

import css from './board.module.css';

interface Racer {
  id: string;
  name: string;
  /** Metres covered since the start. */
  distance: number;
}

const startingGrid = (size: number): Racer[] =>
  Array.from({ length: size }, (_, slot) => ({ id: String(slot), name: `Car ${slot + 1}`, distance: 0 }));

// Every car has its own pace, and its own good and bad laps: a made-up race, the same on every visit.
const lapLength = (racer: Racer, lap: number): number => 400 + ((Number(racer.id) * 37 + lap * 13 + racer.distance) % 97);

const raceLap = (field: readonly Racer[], lap: number): Racer[] =>
  field
    .map((racer) => ({ ...racer, distance: racer.distance + lapLength(racer, lap) }))
    .toSorted((first, second) => second.distance - first.distance);

// `For` renders a row once per `by` key. A new order moves the rows that changed places, and each
// row's bindings rewrite only the texts that changed.
export const Board = (): JSX.Element => {
  const field = signal<readonly Racer[]>(startingGrid(8));
  const lap = signal(0);

  const raceOneLap = (): void => {
    batch(() => {
      lap.value += 1;
      field.value = raceLap(field.value, lap.value);
    });
  };

  return (
    <div className={css.board}>
      <ol className={css.tower}>
        <For each={field} by={(racer) => racer.id}>
          {(racer, place) => (
            <li className={css.row}>
              <b className={css.place}>{() => place() + 1}</b>
              <span className={css.name}>{() => racer().name}</span>
              <data className={css.distance} value={() => String(racer().distance)}>
                {() => `${racer().distance} m`}
              </data>
            </li>
          )}
        </For>
      </ol>
      <div className={css.controls}>
        <button onClick={raceOneLap}>Race a lap</button>
        <p className={css.status}>Lap {lap}</p>
      </div>
    </div>
  );
};
