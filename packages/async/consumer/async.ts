import { retry } from '@reely/async';

const seen: string[] = [];
const rates = await retry(
  async (attempt) => {
    if (attempt < 2) throw 'offline';
    return { EUR: 1, USD: 1.08 };
  },
  { retries: 3, delay: 1, onRetry: (error) => seen.push(error.message) }
);

if (rates.USD !== 1.08 || seen.join() !== 'offline,offline') {
  throw new Error(`unexpected async: ${JSON.stringify({ rates, seen })}`);
}
