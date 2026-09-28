import { batch, computed, For, onCleanup, signal } from '@reely/dommy';

import css from './board.module.css';

interface Racer {
  id: string;
  name: string;
  /** Metres covered since the start. */
  distance: number;
}

const fieldSizes = [100, 300, 500] as const;
const lapMs = 250;
/** The median and the 95th percentile are taken over the last this many laps… */
const timingWindow = 60;
/** …once at least this many are timed: fewer say little about a percentile. */
const timingMinimum = 20;

const startingGrid = (size: number): Racer[] =>
  Array.from({ length: size }, (_, slot) => ({ id: String(slot), name: `Car ${slot + 1}`, distance: 0 }));

// Every car has its own pace, and its own good and bad laps: a made-up race, the same on every visit.
const lapLength = (racer: Racer, lap: number): number => 400 + ((Number(racer.id) * 37 + lap * 13 + racer.distance) % 97);

const raceLap = (field: readonly Racer[], lap: number): Racer[] =>
  field
    .map((racer) => ({ ...racer, distance: racer.distance + lapLength(racer, lap) }))
    .toSorted((first, second) => second.distance - first.distance);

const formatMs = (ms: number | undefined): string => (ms === undefined ? '–' : `${ms.toFixed(1)} ms`);

/** The time below which `share` of the timed laps fall; nothing until enough laps are timed. */
const percentile = (timings: readonly number[], share: number): number | undefined =>
  timings.length < timingMinimum
    ? undefined
    : timings.toSorted((first, second) => first - second)[Math.ceil(share * timings.length) - 1];

// `For` renders a row once per `by` key. A new order moves the rows that changed places, and each
// row's bindings rewrite only the texts that changed. A lap is timed from the write to the finished
// layout, in this browser; a key that changes every lap makes `For` build every row again.
export const Board = (): Node => {
  const size = signal<number>(500);
  const field = signal<readonly Racer[]>(startingGrid(size.value));
  const lap = signal(0);
  const timings = signal<readonly number[]>([]);
  const newKeys = signal(false);
  const running = signal(false);
  let tower: HTMLOListElement | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;

  const raceOneLap = (): void => {
    const start = performance.now();
    batch(() => {
      lap.value += 1;
      field.value = raceLap(field.value, lap.value);
    });
    // reading the height makes the browser lay out the new order now, inside the timing
    void tower?.offsetHeight;
    timings.value = [...timings.value.slice(1 - timingWindow), performance.now() - start];
  };

  const stop = (): void => {
    clearInterval(timer);
    running.value = false;
  };
  const startOrStop = (): void => {
    if (running.value) {
      stop();
    } else {
      timer = setInterval(raceOneLap, lapMs);
      running.value = true;
    }
  };
  onCleanup(stop);

  const resize = (next: number): void => {
    batch(() => {
      size.value = next;
      field.value = startingGrid(next);
      lap.value = 0;
      timings.value = [];
    });
  };
  // each mode is timed on its own
  const switchKeys = (on: boolean): void => {
    batch(() => {
      newKeys.value = on;
      timings.value = [];
    });
  };
  // `peek` reads without subscribing: the key is read while the list updates, not to update it
  const keyOf = (racer: Racer): string => (newKeys.peek() ? `${lap.peek()}:${racer.id}` : racer.id);

  const last = computed(() => formatMs(timings.value.at(-1)));
  const median = computed(() => formatMs(percentile(timings.value, 0.5)));
  const p95 = computed(() => formatMs(percentile(timings.value, 0.95)));

  return (
    <div className={css.board}>
      <ol
        className={`${css.tower} ${css.scroller}`}
        tabIndex={0}
        aria={{ ariaLabel: 'Standings' }}
        elementRef={(element) => {
          tower = element;
        }}
      >
        <For each={field} by={keyOf}>
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
        <button onClick={startOrStop}>{() => (running.value ? 'Stop' : 'Start')}</button>
        <p className={css.status}>Lap {lap}</p>
        <fieldset className={css.sizes}>
          <legend>Cars</legend>
          {fieldSizes.map((option) => (
            <label>
              <input type='radio' name='field-size' checked={option === size.value} onChange={() => resize(option)} />
              {option}
            </label>
          ))}
        </fieldset>
        <label className={css.mode}>
          <input type='checkbox' onChange={(event) => switchKeys(event.currentTarget.checked)} />
          New keys every lap
        </label>
      </div>
      <dl className={css.timing}>
        <div>
          <dt>Last lap</dt>
          <dd>{last}</dd>
        </div>
        <div>
          <dt>Median</dt>
          <dd>{median}</dd>
        </div>
        <div>
          <dt>95th percentile</dt>
          <dd>{p95}</dd>
        </div>
      </dl>
    </div>
  );
};
