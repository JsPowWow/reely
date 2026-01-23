import { noop } from '@reely/utils';

import { reelx, reelxDebug } from './reelx.core';

describe('reelx tests', () => {
  test('should handle basics dependencies', () => {
    const counter = reelx(0);
    const derived = reelx(() => counter() * 2);
    counter(5);
    expect(counter()).toBe(5);
    expect(derived()).toBe(10);
  });

  test('should get the fresh state outside an effect', () => {
    const a = reelx(0);

    const b = () => a();

    expect(b()).toBe(0);

    a(1);
    expect(b()).toBe(1);
  });

  test('should pass performance test', () => {
    const res: Array<number> = [];

    const numbers = Array.from({ length: 2 }, (_, i) => i);

    const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));

    const hard = (n: number) => n + fib(16);

    const A = reelx(0);
    const B = reelx(0);
    const C = reelx(() => (A() % 2) + (B() % 2));
    const D = reelx(
      () => numbers.map((i) => i + (A() % 2) - (B() % 2)),
      (l, r) => l.length === r.length && l.every((v, i) => v === r[i])
    );

    const E = reelx(() => hard(C() + A() + D()[0]!));
    const F = reelx(() => hard(D()[0]! && B()));
    const G = reelx(() => C() + (C() || E() % 2) + D()[0]! + F());
    // @ts-expect-error unit tests
    const ignoredH = G.subscribe((v) => res.push(hard(v, 'H')));
    // @ts-expect-error unit tests
    const ignoredI = G.subscribe((v) => res.push(v));
    // @ts-expect-error unit tests
    const ignoredJ = F.subscribe((v) => res.push(hard(v, 'J')));

    let i = 2;
    while (--i) {
      res.length = 0;
      B(1);
      A(1 + i * 2);
      reelx.flushSync();

      A(2 + i * 2);
      B(2);
      reelx.flushSync();

      expect(res.length).toBe(4);
      expect(res).toEqual([3198, 1601, 3195, 1598]);
    }
  });

  test('should not broke coz an error', () => {
    expect.assertions(2);

    try {
      reelx(() => {
        throw new Error('Test error');
      }).subscribe(noop);
    } catch (e) {
      expect(e).toBeDefined();
    }

    const A = reelx(0);
    const B = reelx(() => A());
    const C = reelx(() => A());
    C.subscribe(noop);

    A(1);
    expect([A(), B(), C()]).toEqual([1, 1, 1]);
  });

  test('should not store duplicated computed(s)', () => {
    const a = reelx(0);
    reelx(() => {
      for (let i = 0; i < 10; i++) {
        a();
      }
    }).subscribe(noop);

    expect(reelxDebug(a).subs()?.size).toBe(1);
  });

  test('should not have stale subscription', () => {
    const a = reelx(0);
    const b = reelx(0);
    reelx(() => b() || a()).subscribe(noop);

    expect(reelxDebug(a).subs()?.size).toBe(1);
    b(123);
    reelx.flushSync();
    expect(reelxDebug(a).subs()?.size).toBe(0);
  });

  test('should correct provide `previous state value` in subscriber', async () => {
    const a = reelx(0);

    let state, prevState;
    a.subscribe((_state, _prevState) => {
      state = _state;
      prevState = _prevState;
    });

    expect(state).toBe(0);
    expect(prevState).toBe(undefined);

    a(1);
    reelx.flushSync();
    expect(state).toBe(1);
    expect(prevState).toBe(0);
  });

  test('redefine reelx scheduler', async () => {
    // delay this test to make others sync test cleaner
    await new Promise((r) => setTimeout(r));

    reelx.schedule = () => {
      setTimeout(reelx.flushSync);
    };

    const a = reelx(0);
    let calls = 0;
    a.subscribe(() => calls++);

    expect(calls).toBe(1);

    a(123);
    await Promise.resolve();
    expect(calls).toBe(1);
    await new Promise((r) => setTimeout(r));
    expect(calls).toBe(2);
  });
});
