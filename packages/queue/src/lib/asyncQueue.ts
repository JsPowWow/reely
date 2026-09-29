import { EventEmitter } from '@reely/emitter';
import type { IEventEmitter } from '@reely/emitter';
import { reportUncaught } from '@reely/utils';

import type { AsyncQueueEvents } from './queue.types';

/**
 * Runs async tasks, at most `concurrency` at a time (1 by default), in the order they were added.
 * A listener that throws does not affect the tasks; its error is reported as uncaught. `drain`
 * comes after the promise of the last task settles.
 */
export class AsyncQueue<R = unknown> {
  public readonly on: IEventEmitter<AsyncQueueEvents<R>>['on'];
  public readonly off: IEventEmitter<AsyncQueueEvents<R>>['off'];

  private readonly concurrency: number;
  private readonly emitter = new EventEmitter<AsyncQueueEvents<R>>();
  private readonly waiting: Array<() => Promise<void>> = [];
  private running = 0;

  /** @throws {RangeError} When `concurrency` is not a whole number of at least 1 (or `Infinity`). */
  public constructor({ concurrency = 1 }: { concurrency?: number } = {}) {
    if (!(concurrency >= 1 && (Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY))) {
      throw new RangeError(`The concurrency of a queue is a whole number of at least 1, not ${concurrency}`);
    }
    this.concurrency = concurrency;
    this.on = this.emitter.on;
    this.off = this.emitter.off;
  }

  /** Runs `task` once a slot is free; the promise settles as the task does. */
  public add<T extends R>(task: () => T | PromiseLike<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.waiting.push(async () => {
        try {
          const result = await task();
          this.running--;
          this.tell(() => this.emitter.emit('success', result));
          this.tell(() => this.emitter.emit('done', { status: 'success', result }));
          resolve(result);
        } catch (error) {
          this.running--;
          this.tell(() => this.emitter.emit('failure', error));
          this.tell(() => this.emitter.emit('done', { status: 'failure', error }));
          reject(error);
        }
        this.next();
        if (this.running === 0 && this.waiting.length === 0) {
          this.tell(() => this.emitter.emit('drain'));
        }
      });
      this.next();
    });
  }

  private next(): void {
    while (this.running < this.concurrency && this.waiting.length > 0) {
      const run = this.waiting.shift();
      this.running++;
      void run?.();
    }
  }

  private tell(emit: () => void): void {
    try {
      emit();
    } catch (error) {
      reportUncaught(error);
    }
  }
}
