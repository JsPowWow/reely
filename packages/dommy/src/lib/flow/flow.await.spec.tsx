import { subscriberCount } from '@reely/signals/testing';

import { Await, For, mount, signal } from '../../index';

import type { AwaitProps } from '../../index';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

const deferred = <T,>(): Deferred<T> => {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
};

const settle = (): Promise<void> => new Promise((done) => setTimeout(done, 0));

/** Collects the rejections nobody handled while `run` goes on, instead of failing the run. */
const collectUnhandled = async (run: () => Promise<void>): Promise<unknown[]> => {
  const reasons: unknown[] = [];
  const listeners = process.listeners('unhandledRejection');
  const collect = (reason: unknown): void => {
    reasons.push(reason);
  };
  process.removeAllListeners('unhandledRejection');
  process.on('unhandledRejection', collect);
  try {
    await run();
    await settle();
  } finally {
    process.off('unhandledRejection', collect);
    listeners.forEach((listener) => process.on('unhandledRejection', listener));
  }
  return reasons;
};

describe('Await', () => {
  it('shows the fallback while the promise is pending, then the result', async () => {
    const final = deferred<string>();
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await catch={(error) => error.message} promise={final.promise} fallback={() => <p>Loading the final</p>}>
        {(winner) => <p>Winner: {winner}</p>}
      </Await>
    ));
    const pending = panel.textContent;

    final.resolve('Car 7');
    await settle();

    expect(pending).toBe('Loading the final');
    expect(panel.textContent).toBe('Winner: Car 7');
  });

  it('renders nothing while pending without a fallback', async () => {
    const panel = document.createElement('section');
    mount(panel, () => <Await catch={(error) => error.message} promise={Promise.resolve(3)}>{(laps) => <p>{laps} laps</p>}</Await>);
    const pending = panel.childNodes.length;

    await settle();

    // the two anchors only, then the result between them
    expect(pending).toBe(2);
    expect(panel.textContent).toBe('3 laps');
  });

  it('shows the catch branch with the reason as an Error when the promise rejects', async () => {
    const panel = document.createElement('section');
    mount(panel, () => (
      <div>
        <Await promise={Promise.reject(new TypeError('No timing data'))} catch={(error) => <p>{error.name}: {error.message}</p>}>
          {() => <p>Results</p>}
        </Await>
        <Await promise={Promise.reject('offline')} catch={(error) => <p>{error.message}</p>}>
          {() => <p>Results</p>}
        </Await>
      </div>
    ));

    await settle();

    expect(Array.from(panel.querySelectorAll('p'), (p) => p.textContent)).toEqual([
      'TypeError: No timing data',
      'offline',
    ]);
  });

  it('shows the catch branch when the promise getter throws before it returns a promise', async () => {
    const lap = signal(1);
    const load = (n: number): Promise<string> => {
      if (n > 1) {
        throw new RangeError(`No timing for lap ${n}`);
      }
      return Promise.resolve('Car 7');
    };
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await promise={() => load(lap.value)} catch={(error) => <p>{error.message}</p>}>
        {(leader) => <p>{leader}</p>}
      </Await>
    ));
    await settle();

    lap.value = 2;
    await settle();

    expect(panel.textContent).toBe('No timing for lap 2');
  });

  it('leaves a throw from the shown branch unhandled rather than lost', async () => {
    const panel = document.createElement('section');
    const failure = new Error('broken results');

    const unhandled = await collectUnhandled(async () => {
      mount(panel, () => (
        <Await catch={(error) => error.message} promise={Promise.resolve('Car 7')}>
          {() => {
            throw failure;
          }}
        </Await>
      ));
      await settle();
    });

    expect(unhandled).toEqual([failure]);
    expect(panel.textContent).toBe('');
  });

  it('shows the error as text when a caller leaves out the required catch branch', async () => {
    const panel = document.createElement('section');
    const props = { promise: Promise.reject(new RangeError('No lap 9')), children: () => 'Results' };

    // @ts-expect-error `catch` is required; a JavaScript caller can still leave it out
    mount(panel, () => Await(props));
    await settle();

    expect(panel.textContent).toBe('RangeError: No lap 9');
  });

  it('waits again when the promise getter reads a changed signal, and drops the result it replaced', async () => {
    const loads = new Map([1, 2].map((lap) => [lap, deferred<string>()]));
    const lap = signal(1);
    const load = vi.fn((n: number) => loads.get(n)?.promise ?? Promise.reject(new Error('no lap')));
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await catch={(error) => error.message} promise={() => load(lap.value)} fallback={() => <p>Loading lap {String(lap.value)}</p>}>
        {(leader) => <p>Leader: {leader}</p>}
      </Await>
    ));

    lap.value = 2;
    const reloading = panel.textContent;
    loads.get(2)?.resolve('Car 3');
    await settle();
    loads.get(1)?.resolve('Car 7');
    await settle();

    expect(load.mock.calls).toEqual([[1], [2]]);
    expect(reloading).toBe('Loading lap 2');
    expect(panel.textContent).toBe('Leader: Car 3');
  });

  it('ignores a rejection of a promise it replaced', async () => {
    const first = deferred<string>();
    const promise = signal<Promise<string>>(first.promise);
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await promise={promise} catch={(error) => <p>{error.message}</p>}>
        {(leader) => <p>{leader}</p>}
      </Await>
    ));

    promise.value = Promise.resolve('Car 3');
    first.reject(new Error('stale'));
    await settle();

    expect(panel.textContent).toBe('Car 3');
  });

  it('updates a shown result through its own bindings, without waiting again', async () => {
    const gap = signal(0.4);
    const load = vi.fn(() => Promise.resolve('Car 7'));
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await catch={(error) => error.message} promise={load}>
        {(leader) => (
          <p>
            {leader} leads by {() => gap.value.toFixed(1)} s
          </p>
        )}
      </Await>
    ));
    await settle();
    const result = panel.querySelector('p');

    gap.value = 1.2;

    expect(load).toHaveBeenCalledOnce();
    expect(panel.querySelector('p')).toBe(result);
    expect(panel.textContent).toBe('Car 7 leads by 1.2 s');
  });

  it('renders nothing and keeps no subscriptions when disposed while pending', async () => {
    const final = deferred<string>();
    const lap = signal(1);
    const tick = signal(0);
    const panel = document.createElement('section');
    const dispose = mount(panel, () => (
      <Await catch={(error) => error.message} promise={() => (lap.value, final.promise)} fallback={() => <p>{tick}</p>}>
        {(winner) => <p>{winner}</p>}
      </Await>
    ));
    const whilePending = subscriberCount(tick);

    dispose();
    final.resolve('Car 7');
    await settle();

    expect(whilePending).toBe(1);
    expect(panel.querySelectorAll('p')).toHaveLength(0);
    expect(subscriberCount(tick)).toBe(0);
    expect(subscriberCount(lap)).toBe(0);
  });

  it('releases the fallback bindings once the result is shown', async () => {
    const dots = signal('.');
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await catch={(error) => error.message} promise={Promise.resolve('Car 7')} fallback={() => <p>Loading{dots}</p>}>
        {(winner) => <p>{winner}</p>}
      </Await>
    ));
    const whilePending = subscriberCount(dots);

    await settle();

    expect(whilePending).toBe(1);
    expect(subscriberCount(dots)).toBe(0);
  });

  it('does not subscribe the promise getter to what the fallback reads while it is built', () => {
    const stop = signal(1);
    const lap = signal(1);
    const load = vi.fn(() => (stop.value, deferred<string>().promise));
    mount(document.createElement('div'), () => (
      <Await catch={(error) => error.message} promise={load} fallback={() => <p>In the pits on lap {String(lap.value)}</p>}>
        {(time) => <p>{time}</p>}
      </Await>
    ));
    stop.value = 2;

    lap.value = 2;

    expect(load).toHaveBeenCalledTimes(2);
    expect(subscriberCount(lap)).toBe(0);
  });

  it('keeps each row of a list waiting on its own promise', async () => {
    const cars = signal(['7', '3']);
    const times = new Map([
      ['7', deferred<number>()],
      ['3', deferred<number>()],
    ]);
    const panel = document.createElement('ol');
    mount(panel, () => (
      <For each={cars} by={(car) => car}>
        {(car) => (
          <li>
            Car {car}:{' '}
            <Await catch={(error) => error.message} promise={times.get(car())?.promise ?? Promise.resolve(0)} fallback={() => 'timing'}>
              {(seconds) => `${seconds} s`}
            </Await>
          </li>
        )}
      </For>
    ));

    times.get('3')?.resolve(81.2);
    await settle();
    const [seven, three] = Array.from(panel.querySelectorAll('li'), (row) => row.textContent);

    expect([seven, three]).toEqual(['Car 7: timing', 'Car 3: 81.2 s']);
  });

  it('types the value the children receive from the promise', async () => {
    const panel = document.createElement('section');
    mount(panel, () => (
      <Await catch={(error) => error.message} promise={Promise.resolve({ laps: 5 })}>
        {(race) => {
          expectTypeOf(race).toEqualTypeOf<{ laps: number }>();
          return race.laps;
        }}
      </Await>
    ));

    await settle();

    expect(panel.textContent).toBe('5');
    expectTypeOf<{ promise: Promise<string>; children: (laps: number) => number; catch: () => null }>().not.toMatchTypeOf<
      AwaitProps<number>
    >();
    expectTypeOf<{ promise: Promise<number>; children: (laps: number) => number }>().not.toMatchTypeOf<
      AwaitProps<number>
    >();
  });
});
