import { AsyncQueue, SyncQueue } from '@reely/queue';
import type { AsyncOutcome, SyncRun } from '@reely/queue';

const sync = new SyncQueue<string>();
const steps: string[] = [];
const outer: SyncRun<string> = sync.add(() => {
  const inner = sync.add(() => {
    steps.push('inner');
    return 'inner';
  });
  steps.push(inner.status);
  return 'outer';
});

const queue = new AsyncQueue<number>();
const outcomes: Array<AsyncOutcome<number>['status']> = [];
queue.on('done', (outcome) => outcomes.push(outcome.status));

const results = await Promise.allSettled([queue.add(() => 1), queue.add(() => Promise.reject(new Error('lap')))]);

if (
  outer.status !== 'done' ||
  steps.join() !== 'queued,inner' ||
  outcomes.join() !== 'success,failure' ||
  results[0].status !== 'fulfilled'
) {
  throw new Error(`unexpected queues: ${JSON.stringify({ outer, steps, outcomes })}`);
}
