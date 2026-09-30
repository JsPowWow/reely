import { retry, TimeoutError } from '@reely/async';

const seen: string[] = [];
const rates = await retry(
  async (attempt) => {
    if (attempt < 2) throw 'offline';
    return { EUR: 1, USD: 1.08 };
  },
  { retries: 3, delay: 1, onRetry: (error) => seen.push(error.message) }
);

if (Math.abs(rates.USD - 1.08) > Number.EPSILON || seen.join() !== 'offline,offline') {
  throw new Error(`unexpected async: ${JSON.stringify({ rates, seen })}`);
}

// an attempt that hangs is cut by `timeout`, and its signal tells the task to stop
let aborted = false;
const late = await retry(
  (attempt, signal) =>
    attempt === 0
      ? new Promise<string>(() => signal.addEventListener('abort', () => (aborted = true)))
      : Promise.resolve('second try'),
  { timeout: 10, delay: 1 }
);

const controller = new AbortController();
controller.abort(new TimeoutError('gone'));
const stopped = await retry(() => Promise.resolve('never'), { signal: controller.signal }).catch(
  (reason: unknown) => reason
);

if (late !== 'second try' || !aborted || !(stopped instanceof TimeoutError)) {
  throw new Error(`unexpected async: ${JSON.stringify({ late, aborted, stopped })}`);
}
