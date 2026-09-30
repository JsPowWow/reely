# @reely/async

Retry an async task with exponential backoff.

```sh
npm i @reely/async
```

## retry

`retry(task, options?)` calls `task(attempt, signal)` until it resolves, waiting `delay` ms before the first retry and `factor` times longer before each next one, up to `maxDelay`. After `retries` retries it throws what the last attempt threw.

```ts
import { retry } from '@reely/async';

const rates = await retry(
  async () => {
    const response = await fetch('https://api.example.com/rates?base=EUR');
    if (!response.ok) throw new Error(`rates: HTTP ${response.status}`);
    return response.json();
  },
  {
    retries: 4, // 3 by default
    delay: 500, // 1000 ms by default
    shouldRetry: (error) => !error.message.includes('HTTP 4'), // a 404 will not heal by waiting
    onRetry: (error, attempt, nextDelay) => statusLine.show(`Offline, retrying in ${nextDelay / 1000} s`),
  }
);
```

| option        | default | meaning                                                 |
| ------------- | ------- | ------------------------------------------------------- |
| `retries`     | 3       | retries after the first attempt                         |
| `delay`       | 1000    | ms before the first retry                               |
| `factor`      | 2       | how much longer each next wait is                       |
| `maxDelay`    | 30000   | the longest wait                                        |
| `shouldRetry` | always  | `(error, attempt) => boolean`; `false` rethrows at once |
| `onRetry`     | nothing | `(error, attempt, nextDelay)`, called before each wait  |
| `timeout`     | none    | ms an attempt may run; then it fails with `TimeoutError` |
| `signal`      | none    | an `AbortSignal` that stops the attempts and the waits  |

## Cancel and time out

Each attempt gets a signal: pass it to `fetch`, and the request is cancelled when the attempt times out or your `signal` aborts. A timed-out attempt fails with a `TimeoutError` and is retried like any failure; an aborted `signal` rejects `retry` at once with its reason, even in the middle of a wait.

```ts
let checking: AbortController | undefined;

const checkLogin = async (login: string): Promise<boolean> => {
  checking?.abort(); // a newer login makes the older check pointless
  checking = new AbortController();
  const response = await retry((_attempt, signal) => fetch(`https://api.github.com/users/${login}`, { signal }), {
    timeout: 5000,
    signal: checking.signal,
  });
  return response.ok;
};
```

`shouldRetry` and `onRetry` get an `Error`: a task that throws something else, a string say, has it wrapped for them, and `retry` still rethrows the original value.

## Presets and many tasks

```ts
import { createRetry, retryAll, withRetry } from '@reely/async';

const patiently = createRetry({ retries: 5, delay: 2000 }); // shared options, overridable per call
const profile = await patiently(() => loadProfile(userId));

const saveDraft = withRetry(api.saveDraft, { retries: 2 }); // same parameters, retries on every call
await saveDraft(draft);

const [avatar, banner] = await retryAll([() => upload(avatarFile), () => upload(bannerFile)]); // each task retried on its own; one failing for good stops the other
```

`retryRace` resolves with the first task to succeed after its retries and stops the rest, and rejects with an `AggregateError` only once every task has failed; `retryAllSettled` never rejects and returns every result, as `Promise.allSettled`.

The signals need `AbortSignal.any`: Node 20.3+, and every current browser (Safari 17.4+, Firefox 124+).
