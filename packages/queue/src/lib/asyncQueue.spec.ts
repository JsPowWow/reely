import { AsyncQueue } from './asyncQueue';


const later = <T>(value: T, ms = 1): Promise<T> => new Promise((resolve) => setTimeout(resolve, ms, value));

/** A task that records how many tasks ran at once. */
const tracker = (): { task: <T>(value: T) => () => Promise<T>; max: () => number; order: unknown[] } => {
  let running = 0;
  let max = 0;
  const order: unknown[] = [];
  return {
    task: (value) => async () => {
      running++;
      max = Math.max(max, running);
      order.push(value);
      await later(undefined);
      running--;
      return value;
    },
    max: () => max,
    order,
  };
};

describe('AsyncQueue', () => {
  it('gives each task its own result, whether the task is async or not', async () => {
    const queue = new AsyncQueue();

    await expect(Promise.all([queue.add(() => later('lap')), queue.add(() => 3)])).resolves.toStrictEqual(['lap', 3]);
  });

  it('runs one task at a time by default, in the order they were added', async () => {
    const queue = new AsyncQueue();
    const { task, max, order } = tracker();

    await Promise.all([1, 2, 3].map((n) => queue.add(task(n))));

    expect([max(), order]).toStrictEqual([1, [1, 2, 3]]);
  });

  it('runs up to `concurrency` tasks at a time', async () => {
    const queue = new AsyncQueue({ concurrency: 2 });
    const { task, max } = tracker();

    await Promise.all([1, 2, 3, 4, 5].map((n) => queue.add(task(n))));

    expect(max()).toBe(2);
  });

  it('starts a task within `add` when a slot is free', () => {
    const queue = new AsyncQueue();
    const task = vi.fn(() => 1);

    void queue.add(task);

    expect(task).toHaveBeenCalledOnce();
  });

  it('rejects the promise of a failed task and runs the next one', async () => {
    const queue = new AsyncQueue();
    const broken = new Error('broken lap');

    const failed = queue.add(() => Promise.reject(broken));
    const thrown = queue.add(() => {
      throw broken;
    });
    const next = queue.add(() => 'next');

    await expect(failed).rejects.toBe(broken);
    await expect(thrown).rejects.toBe(broken);
    await expect(next).resolves.toBe('next');
  });

  it('rejects a concurrency that is not a whole number of at least 1', () => {
    for (const concurrency of [0, -1, 1.5, Number.NaN]) {
      expect(() => new AsyncQueue({ concurrency })).toThrow(RangeError);
    }
    expect(() => new AsyncQueue({ concurrency: Number.POSITIVE_INFINITY })).not.toThrow();
  });

  it('tells its listeners of each outcome, then that it drained', async () => {
    const queue = new AsyncQueue<number>();
    const events: unknown[] = [];
    const broken = new Error('broken lap');
    queue.on('success', (result) => events.push(['success', result]));
    queue.on('failure', (error) => events.push(['failure', error]));
    queue.on('done', (outcome) => events.push(['done', outcome.status]));
    queue.on('drain', () => events.push(['drain']));

    await Promise.allSettled([queue.add(() => later(1)), queue.add(() => Promise.reject(broken))]);
    await later(undefined);

    expect(events).toStrictEqual([
      ['success', 1],
      ['done', 'success'],
      ['failure', broken],
      ['done', 'failure'],
      ['drain'],
    ]);
  });

  it('stops telling a listener it unsubscribed', async () => {
    const queue = new AsyncQueue();
    const drain = vi.fn();
    const stop = queue.on('drain', drain);
    await queue.add(() => 1);
    await later(undefined);

    stop();
    await queue.add(() => 2);
    await later(undefined);

    expect(drain).toHaveBeenCalledOnce();
  });

  it('keeps a listener that throws from breaking the task or the queue, and reports its error', async () => {
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const reported: unknown[] = [];
    vi.stubGlobal('reportError', (error: unknown) => reported.push(error));
    const queue = new AsyncQueue();
    const broken = new Error('broken listener');
    queue.on('success', () => {
      throw broken;
    });

    await expect(queue.add(() => 1)).resolves.toBe(1);
    await expect(queue.add(() => 2)).resolves.toBe(2);

    expect(reported).toStrictEqual([broken, broken]);
  });

  it('frees the slot before the promise of a task settles, so the next task starts within its add', async () => {
    const queue = new AsyncQueue();
    const next = vi.fn(() => 2);

    await queue.add(() => later(1));
    void queue.add(next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('drains once when parallel tasks finish, and again after a task a drain listener added', async () => {
    const queue = new AsyncQueue({ concurrency: 3 });
    const events: string[] = [];
    let first = true;
    queue.on('drain', () => {
      events.push('drain');
      if (first) {
        first = false;
        void queue.add(() => events.push('added by drain'));
      }
    });

    await Promise.all([1, 2, 3].map((n) => queue.add(() => later(n))));
    await later(undefined);

    expect(events).toStrictEqual(['drain', 'added by drain', 'drain']);
  });

  it('runs a task a `done` listener adds', async () => {
    const queue = new AsyncQueue<string>();
    const followUp = vi.fn((): string => 'follow-up');
    const stop = queue.on('done', () => {
      stop();
      void queue.add(followUp);
    });

    await queue.add(() => 'lap');
    await later(undefined);

    expect(followUp).toHaveBeenCalledOnce();
  });
});

// never run: the compiler checks these uses
export async function typed(queue: AsyncQueue<number>): Promise<void> {
  const exact: 3 = await queue.add((): 3 => 3);
  const awaited: number = await queue.add(async () => later(1));
  queue.on('success', (result) => expectTypeOf(result).toEqualTypeOf<number>());
  queue.on('done', (outcome) => {
    if (outcome.status === 'success') {
      expectTypeOf(outcome.result).toEqualTypeOf<number>();
    }
  });
  // @ts-expect-error a task of this queue gives a number
  await queue.add(() => 'lap');
  // @ts-expect-error an async task of this queue gives a number
  await queue.add(async () => 'lap');
  void [exact, awaited];
}
