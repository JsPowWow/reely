import { reportUncaught } from '@reely/basics';

import type { SyncRun } from './queue.types';

/**
 * Runs tasks synchronously, one at a time. A task added while another runs waits for it and runs
 * before the outer `add` returns (run-to-completion). `add` throws only the error of its own task;
 * a queued task has no caller left to throw to, so its error is reported as uncaught.
 */
export class SyncQueue<R = unknown> {
  private readonly waiting: Array<() => unknown> = [];
  private running = false;

  public add<T extends R>(task: () => T): SyncRun<T> {
    if (this.running) {
      this.waiting.push(task);
      return { status: 'queued' };
    }
    this.running = true;
    try {
      return { status: 'done', result: task() };
    } finally {
      for (let next = this.waiting.shift(); next; next = this.waiting.shift()) {
        try {
          next();
        } catch (error) {
          reportUncaught(error);
        }
      }
      this.running = false;
    }
  }
}
