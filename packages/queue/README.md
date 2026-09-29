# @reely/queue

Two task queues: a sync one that runs a task to completion before the next, and an async one that runs at most `concurrency` tasks at a time.

```sh
npm i @reely/queue
```

## SyncQueue

A task added while another runs waits for it, and runs before the outer `add` returns (run-to-completion). A state machine uses it so that an event sent from inside a transition runs after that transition, not in the middle of it.

```ts
import { SyncQueue } from '@reely/queue';

const queue = new SyncQueue();

queue.add(() => {
  queue.add(() => console.log('second')); // { status: 'queued' }: runs once the first is done
  console.log('first');
  return 'lap';
}); // { status: 'done', result: 'lap' }, after both have run
```

`add` throws the error of its own task. A queued task has no caller left to throw to, so its error is reported as uncaught (see `reportUncaught` in `@reely/basics`), and the tasks after it still run.

## AsyncQueue

Tasks start in the order they were added, at most `concurrency` at a time (1 by default, `Infinity` for no limit). `add` returns a promise that settles as its task does; a task starts inside `add` when a slot is free. Listeners, added with `on` as in `@reely/emitter`, hear `success`, `failure` and `done` before that promise settles.

```ts
import { AsyncQueue } from '@reely/queue';

const uploads = new AsyncQueue<Response>({ concurrency: 2 });
uploads.on('drain', () => console.log('all uploaded'));

const responses = await Promise.all(
  files.map((file) => uploads.add(() => fetch('/upload', { method: 'POST', body: file })))
);
```

| event     | when                           | data                                                              |
| --------- | ------------------------------ | ----------------------------------------------------------------- |
| `success` | a task resolved                | its result                                                        |
| `failure` | a task threw or rejected       | the error                                                         |
| `done`    | after either                   | `{ status: 'success', result }` or `{ status: 'failure', error }` |
| `drain`   | nothing runs and nothing waits | —                                                                 |

A listener that throws does not affect the tasks; its error is reported as uncaught. A `concurrency` that is not a whole number of at least 1 throws a `RangeError`.
