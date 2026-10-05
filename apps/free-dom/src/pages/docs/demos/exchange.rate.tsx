import { Await, Show, signal } from '@reely/dommy';

import css from './demos.module.css';

/** How long the bank takes to answer, in milliseconds of the page; the rates are made up. */
export const quoteDelay = 900;

const rates = [1.084, 1.086, 1.083, 1.089];

// the bank answers a request later: with the rate, or, on the third request, with a failure
const askBank = (request: number): Promise<number> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (request === 3) {
        reject(new Error('The bank timed out. Refresh again.'));
      } else {
        resolve(rates[(request - 1) % rates.length] ?? 0);
      }
    }, quoteDelay);
  });

// `Await` shows the fallback while the bank answers, then the rate or the failure; a newer request drops the older one.
export const ExchangeRate = (): Node => {
  const request = signal(0);

  return (
    <div className={css.row}>
      <Show
        when={() => request.value > 0}
        fallback={() => (
          <p className={css.pending}>EUR to USD: not loaded yet</p>
        )}
      >
        {() => (
          <Await
            promise={() => askBank(request.value)}
            fallback={() => <p className={css.pending}>Asking the bank…</p>}
            catch={(error) => <p className={css.failed}>{error.message}</p>}
          >
            {(rate) => (
              <p className={css.plate}>1 EUR = {rate.toFixed(3)} USD</p>
            )}
          </Await>
        )}
      </Show>
      <button onClick={() => (request.value += 1)}>Refresh the rate</button>
    </div>
  );
};
