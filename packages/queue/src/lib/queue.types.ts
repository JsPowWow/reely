/** What `SyncQueue.add` did: ran the task, or queued it behind the one running. */
export type SyncRun<R> = { status: 'done'; result: R } | { status: 'queued' };

export type AsyncOutcome<R> = { status: 'success'; result: R } | { status: 'failure'; error: unknown };

export interface AsyncQueueEvents<R> {
  success: R;
  failure: unknown;
  done: AsyncOutcome<R>;
  /** Nothing runs and nothing waits. */
  drain: undefined;
}
