import { batch, computed, For, onCleanup, signal } from '@reely/dommy';

import css from './board.module.css';

interface Stock {
  id: string;
  symbol: string;
  /** Today's change, in hundredths of a percent. */
  change: number;
}

const marketSizes = [100, 300, 500] as const;
const tickMs = 250;
/** The median and the 95th percentile are taken over the last this many updates… */
const timingWindow = 60;
/** …once at least this many are timed: fewer say little about a percentile. */
const timingMinimum = 20;

// three letters per stock, all different: 263 and 26³ share no factor
const symbolOf = (slot: number): string => {
  const code = (slot * 263 + 1331) % 26 ** 3;
  return [code / 26 ** 2, code / 26, code]
    .map((digit) => String.fromCharCode(65 + (Math.floor(digit) % 26)))
    .join('');
};

const marketAtOpen = (size: number): Stock[] =>
  Array.from({ length: size }, (_, slot) => ({
    id: String(slot),
    symbol: symbolOf(slot),
    change: 0,
  }));

// Every stock has its own drift, and its own good and bad ticks: a made-up market, the same on every visit.
const tickMove = (stock: Stock, tick: number): number =>
  ((Number(stock.id) * 37 + tick * 13 + Math.abs(stock.change)) % 97) - 48;

const priceTick = (market: readonly Stock[], tick: number): Stock[] =>
  market
    .map((stock) => ({
      ...stock,
      change: stock.change + tickMove(stock, tick),
    }))
    .toSorted((first, second) => second.change - first.change);

const formatChange = (change: number): string =>
  `${change < 0 ? '−' : '+'}${(Math.abs(change) / 100).toFixed(2)}%`;

const formatMs = (ms: number | undefined): string =>
  ms === undefined ? '–' : `${ms.toFixed(1)} ms`;

/** The time below which `share` of the timed updates fall; nothing until enough are timed. */
const percentile = (
  timings: readonly number[],
  share: number
): number | undefined =>
  timings.length < timingMinimum
    ? undefined
    : timings.toSorted((first, second) => first - second)[
        Math.ceil(share * timings.length) - 1
      ];

// Top movers of a whole index: `For` renders a row once per `by` key. A new order moves the rows
// that changed places, and each row's bindings rewrite only the texts that changed. An update is
// timed from the write to the finished layout, in this browser; a key that changes every update
// makes `For` build every row again.
export const Board = (): Node => {
  const size = signal<number>(500);
  const market = signal<readonly Stock[]>(marketAtOpen(size.value));
  const tick = signal(0);
  const timings = signal<readonly number[]>([]);
  const newKeys = signal(false);
  const running = signal(false);
  let tower: HTMLOListElement | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;

  const updatePrices = (): void => {
    const start = performance.now();
    batch(() => {
      tick.value += 1;
      market.value = priceTick(market.value, tick.value);
    });
    // reading the height makes the browser lay out the new order now, inside the timing
    void tower?.offsetHeight;
    timings.value = [
      ...timings.value.slice(1 - timingWindow),
      performance.now() - start,
    ];
  };

  const stop = (): void => {
    clearInterval(timer);
    running.value = false;
  };
  const startOrStop = (): void => {
    if (running.value) {
      stop();
    } else {
      timer = setInterval(updatePrices, tickMs);
      running.value = true;
    }
  };
  onCleanup(stop);

  const resize = (next: number): void => {
    batch(() => {
      size.value = next;
      market.value = marketAtOpen(next);
      tick.value = 0;
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
  const keyOf = (stock: Stock): string =>
    newKeys.peek() ? `${tick.peek()}:${stock.id}` : stock.id;

  const last = computed(() => formatMs(timings.value.at(-1)));
  const median = computed(() => formatMs(percentile(timings.value, 0.5)));
  const p95 = computed(() => formatMs(percentile(timings.value, 0.95)));

  return (
    <div className={css.board}>
      <ol
        className={`${css.tower} ${css.scroller}`}
        tabIndex={0}
        aria={{ ariaLabel: 'Top movers' }}
        elementRef={(element) => {
          tower = element;
        }}
      >
        <For each={market} by={keyOf}>
          {(stock, rank) => (
            <li className={css.row}>
              <b className={css.place}>{() => rank() + 1}</b>
              <span className={css.name}>{() => stock().symbol}</span>
              <data className={css.change} value={() => String(stock().change)}>
                {() => formatChange(stock().change)}
              </data>
            </li>
          )}
        </For>
      </ol>
      <div className={css.controls}>
        <button onClick={startOrStop}>
          {() => (running.value ? 'Stop' : 'Start')}
        </button>
        <p className={css.status}>Update {tick}</p>
        <fieldset className={css.sizes}>
          <legend>Stocks</legend>
          {marketSizes.map((option) => (
            <label>
              <input
                type='radio'
                name='market-size'
                checked={option === size.value}
                onChange={() => resize(option)}
              />
              {option}
            </label>
          ))}
        </fieldset>
        <label className={css.mode}>
          <input
            type='checkbox'
            onChange={(event) => switchKeys(event.currentTarget.checked)}
          />
          New keys every update
        </label>
      </div>
      <dl className={css.timing}>
        <div>
          <dt>Last update</dt>
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
