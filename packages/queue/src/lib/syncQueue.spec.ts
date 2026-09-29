import { SyncQueue } from './syncQueue';

describe('SyncQueue', () => {
  it('runs a task at once and gives its result', () => {
    const queue = new SyncQueue();

    expect(queue.add(() => 42)).toStrictEqual({ status: 'done', result: 42 });
  });

  it('runs a task added by a running one after it, before the outer add returns', () => {
    const queue = new SyncQueue();
    const steps: string[] = [];

    const outer = queue.add(() => {
      steps.push('outer starts');
      const inner = queue.add(() => {
        steps.push('inner');
        return 'inner result';
      });
      steps.push(`inner ${inner.status}`);
      return 'outer result';
    });
    steps.push('outer returned');

    expect(outer).toStrictEqual({ status: 'done', result: 'outer result' });
    expect(steps).toStrictEqual(['outer starts', 'inner queued', 'inner', 'outer returned']);
  });

  it('runs the queued tasks in the order they were added', () => {
    const queue = new SyncQueue();
    const steps: number[] = [];

    queue.add(() => {
      queue.add(() => {
        steps.push(2);
        queue.add(() => steps.push(4));
      });
      queue.add(() => steps.push(3));
      steps.push(1);
    });

    expect(steps).toStrictEqual([1, 2, 3, 4]);
  });

  it('throws the error of its own task, after the queued tasks ran', () => {
    const queue = new SyncQueue();
    const broken = new Error('broken step');
    const queued = vi.fn();

    expect(() =>
      queue.add(() => {
        queue.add(queued);
        throw broken;
      })
    ).toThrow(broken);
    expect(queued).toHaveBeenCalledOnce();
    expect(queue.add(() => 'still works')).toStrictEqual({ status: 'done', result: 'still works' });
  });

  it('gives its own result when a queued task throws, and reports that error as uncaught', () => {
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const reported: unknown[] = [];
    vi.stubGlobal('reportError', (error: unknown) => reported.push(error));
    const queue = new SyncQueue();
    const broken = new Error('broken queued step');
    const after = vi.fn();

    const run = queue.add(() => {
      queue.add(() => {
        throw broken;
      });
      queue.add(after);
      return 'outer';
    });

    expect(run).toStrictEqual({ status: 'done', result: 'outer' });
    expect(after).toHaveBeenCalledOnce();
    expect(reported).toStrictEqual([broken]);
  });
});

// never run: the compiler checks these uses
export function typed(sync: SyncQueue<string>): void {
  const run = sync.add(() => 'lap');
  if (run.status === 'done') {
    expectTypeOf(run.result).toEqualTypeOf<'lap'>();
  }
  // @ts-expect-error a task of this queue gives a string
  sync.add(() => 1);
}
