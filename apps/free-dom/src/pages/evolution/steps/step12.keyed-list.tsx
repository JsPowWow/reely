import { batch, For, signal } from '@reely/dommy';

import css from './board.module.css';

interface Stock {
  id: string;
  symbol: string;
  /** Today's change, in hundredths of a percent. */
  change: number;
}

// three letters per stock, all different: 263 and 26³ share no factor
const symbolOf = (slot: number): string => {
  const code = (slot * 263 + 1331) % 26 ** 3;
  return [code / 26 ** 2, code / 26, code].map((digit) => String.fromCharCode(65 + (Math.floor(digit) % 26))).join('');
};

const marketAtOpen = (size: number): Stock[] =>
  Array.from({ length: size }, (_, slot) => ({ id: String(slot), symbol: symbolOf(slot), change: 0 }));

// Every stock has its own drift, and its own good and bad ticks: a made-up market, the same on every visit.
const tickMove = (stock: Stock, tick: number): number =>
  ((Number(stock.id) * 37 + tick * 13 + Math.abs(stock.change)) % 97) - 48;

const priceTick = (market: readonly Stock[], tick: number): Stock[] =>
  market
    .map((stock) => ({ ...stock, change: stock.change + tickMove(stock, tick) }))
    .toSorted((first, second) => second.change - first.change);

const formatChange = (change: number): string => `${change < 0 ? '−' : '+'}${(Math.abs(change) / 100).toFixed(2)}%`;

// Top movers: `For` renders a row once per `by` key. A new order moves the rows that changed
// places, and each row's bindings rewrite only the texts that changed.
export const Board = (): Node => {
  const market = signal<readonly Stock[]>(marketAtOpen(8));
  const tick = signal(0);

  const updatePrices = (): void => {
    batch(() => {
      tick.value += 1;
      market.value = priceTick(market.value, tick.value);
    });
  };

  return (
    <div className={css.board}>
      <ol className={css.tower}>
        <For each={market} by={(stock) => stock.id}>
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
        <button onClick={updatePrices}>Update prices</button>
        <p className={css.status}>Update {tick}</p>
      </div>
    </div>
  );
};
