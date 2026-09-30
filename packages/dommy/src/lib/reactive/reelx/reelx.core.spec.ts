// The core's own contract, beside the public one: tests that need its internal hooks.
import { noop } from '@reely/utils';

import { reelxDebug } from './reelx.core';
import { batch, computed, effect, signal } from '../preact-like/preact-like.signal';

describe('the signal core', () => {
  it('reads a derived value after a write', () => {
    const counter = signal(0);
    const derived = computed(() => counter() * 2);

    counter.set(5);

    expect([counter(), derived()]).toStrictEqual([5, 10]);
  });

  it('reads the fresh value through a plain function', () => {
    const a = signal(0);
    const b = (): number => a();

    a.set(1);

    expect(b()).toBe(1);
  });

  it('computes a graph with shared and conditional dependencies once per batch', () => {
    const results: number[] = [];
    const numbers = [0, 1];
    const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));
    const hard = (n: number): number => n + fib(16);

    const a = signal(0);
    const b = signal(0);
    const c = computed(() => (a() % 2) + (b() % 2));
    const d = computed(() => numbers.map((i) => i + (a() % 2) - (b() % 2)));
    const e = computed(() => hard(c() + a() + (d()[0] ?? 0)));
    const f = computed(() => hard((d()[0] ?? 0) && b()));
    const g = computed(() => c() + (c() || e() % 2) + (d()[0] ?? 0) + f());
    g.subscribe((value) => results.push(hard(value)));
    g.subscribe((value) => results.push(value));
    f.subscribe((value) => results.push(hard(value)));

    results.length = 0;
    batch(() => {
      b.set(1);
      a.set(3);
    });
    batch(() => {
      a.set(4);
      b.set(2);
    });

    expect(results).toStrictEqual([3198, 1601, 3195, 1598]);
  });

  it('keeps working after a computed throws at its first subscription', () => {
    expect(() =>
      computed(() => {
        throw new Error('broken');
      }).subscribe(noop)
    ).toThrow('broken');

    const a = signal(0);
    const b = computed(() => a());
    const c = computed(() => a());
    c.subscribe(noop);
    a.set(1);

    expect([a(), b(), c()]).toStrictEqual([1, 1, 1]);
  });

  it('subscribes a reader once to a signal it reads many times', () => {
    const a = signal(0);
    effect(() => {
      for (let i = 0; i < 10; i++) {
        a();
      }
    });

    expect(reelxDebug(a).subscriberCount()).toBe(1);
  });

  it('drops a dependency a reader no longer reads', () => {
    const a = signal(0);
    const b = signal(0);
    effect(() => void (b() || a()));
    expect(reelxDebug(a).subscriberCount()).toBe(1);

    b.set(123);

    expect(reelxDebug(a).subscriberCount()).toBe(0);
  });
});
