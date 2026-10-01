import { retry } from '@reely/async';
import { For, onCleanup, signal } from '@reely/dommy';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

interface Rates {
  USD: number;
  GBP: number;
}

const wait = (ms: number, cancel: AbortSignal): Promise<void> =>
  new Promise((done) => {
    const timer = setTimeout(done, ms);
    cancel.addEventListener('abort', () => clearTimeout(timer));
  });

// a rates API on a bad day: the first call fails, the second hangs
const fetchRates = async (
  attempt: number,
  cancel: AbortSignal
): Promise<Rates> => {
  await wait(attempt === 1 ? 60_000 : 300, cancel);
  if (attempt === 0) {
    throw new Error('HTTP 503');
  }
  return { USD: 1.08, GBP: 0.85 };
};

// `retry` waits longer before each next attempt, cuts one
// that runs past `timeout`, and stops when the page is left.
export const RatesRetry = (): Node => {
  const retries = signal<readonly { attempt: number; text: string }[]>([]);
  const rates = signal('');
  const loading = signal(false);
  const leaving = new AbortController();
  onCleanup(() => leaving.abort());

  const load = async (): Promise<void> => {
    loading.value = true;
    retries.value = [];
    rates.value = 'Loading…';
    try {
      const { USD, GBP } = await retry(fetchRates, {
        delay: 500,
        timeout: 1500,
        signal: leaving.signal,
        onRetry: (error, attempt, next) => {
          const text = `Attempt ${attempt + 1}: ${error.message}`;
          retries.value = [
            ...retries.value,
            { attempt, text: `${text}, retrying in ${next} ms` },
          ];
        },
      });
      rates.value = `1 EUR = ${USD} USD = ${GBP} GBP`;
    } catch {
      rates.value = 'No rates today';
    } finally {
      loading.value = false;
    }
  };

  return (
    <div className={css.stack}>
      <button
        type='button'
        className={css.solid}
        disabled={loading}
        onClick={() => void load()}
      >
        Load the rates
      </button>
      <ul className={own.ticker}>
        <For each={retries} by={(line) => line.attempt}>
          {(line) => <li>{() => line().text}</li>}
        </For>
      </ul>
      <p className={css.note}>{rates}</p>
    </div>
  );
};
