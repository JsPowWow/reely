# @reely/async

Retry an async task with exponential backoff.

```sh
npm i @reely/async
```

## retry

`retry(task, options?)` calls `task(attempt)` until it resolves, waiting `delay` ms before the first retry and `factor` times longer before each next one, up to `maxDelay`. After `retries` retries it throws what the last attempt threw.

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

`shouldRetry` and `onRetry` get an `Error`: a task that throws something else, a string say, has it wrapped for them, and `retry` still rethrows the original value.

## Presets and many tasks

```ts
import { createRetry, retryAll, withRetry } from '@reely/async';

const patiently = createRetry({ retries: 5, delay: 2000 }); // shared options, overridable per call
const profile = await patiently(() => loadProfile(userId));

const saveDraft = withRetry(api.saveDraft, { retries: 2 }); // same parameters, retries on every call
await saveDraft(draft);

const [avatar, banner] = await retryAll([() => upload(avatarFile), () => upload(bannerFile)]); // each task retried on its own
```

`retryRace` resolves with the first task to succeed after its retries; `retryAllSettled` never rejects and returns every result, as `Promise.allSettled`.
