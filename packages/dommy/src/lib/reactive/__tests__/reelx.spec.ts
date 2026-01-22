import { noop } from '@reely/utils';

import { reelxCore, reelxDebug } from '../reelx.core';

test('should get the fresh state outside an effect', () => {
  const a = reelxCore(0);

  const b = () => a();

  expect(b()).toBe(0);

  a(1);
  expect(b()).toBe(1);
});

test('performance', () => {
  const res: Array<number> = [];

  const numbers = Array.from({ length: 2 }, (_, i) => i);

  const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));

  const hard = (n: number) => n + fib(16);

  const A = reelxCore(0);
  const B = reelxCore(0);
  const C = reelxCore(() => (A() % 2) + (B() % 2));
  const D = reelxCore(
    () => numbers.map((i) => i + (A() % 2) - (B() % 2)),
    (l, r) => l.length === r.length && l.every((v, i) => v === r[i])
  );

  const E = reelxCore(() => hard(C() + A() + D()[0]!));
  const F = reelxCore(() => hard(D()[0]! && B()));
  const G = reelxCore(() => C() + (C() || E() % 2) + D()[0]! + F());
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
    reelxCore.notify();

    A(2 + i * 2);
    B(2);
    reelxCore.notify();

    expect(res.length).toBe(4);
    expect(res).toEqual([3198, 1601, 3195, 1598]);
  }
});

test('should not broke coz an error', () => {
  expect.assertions(2);

  try {
    reelxCore(() => {
      throw new Error('Test error');
    }).subscribe(noop);
  } catch (e) {
    expect(e).toBeDefined();
  }

  const A = reelxCore(0);
  const B = reelxCore(() => A());
  const C = reelxCore(() => A());
  C.subscribe(noop);

  A(1);
  expect([A(), B(), C()]).toEqual([1, 1, 1]);
});

test('should not store duplicated computed(s)', () => {
  const a = reelxCore(0);
  reelxCore(() => {
    for (let i = 0; i < 10; i++) a();
  }).subscribe(noop);

  expect(reelxDebug(a).subs()?.size).toBe(1);
});

test('should not have stale subscription', () => {
  const a = reelxCore(0);
  const b = reelxCore(0);
  reelxCore(() => b() || a()).subscribe(noop);

  expect(reelxDebug(a).subs()?.size).toBe(1);
  b(123);
  reelxCore.notify();
  expect(reelxDebug(a).subs()?.size).toBe(0);
});

test('prevState for a subscriber', async () => {
  const a = reelxCore(0);

  let state, prevState;
  a.subscribe((_state, _prevState) => {
    state = _state;
    prevState = _prevState;
  });

  expect(state).toBe(0);
  expect(prevState).toBe(undefined);

  a(1);
  reelxCore.notify();
  expect(state).toBe(1);
  expect(prevState).toBe(0);
});

test('redefine reelx.notify', async () => {
  // delay this test to make others sync test cleaner
  await new Promise((r) => setTimeout(r));

  reelxCore.notify.schedule = () => {
    setTimeout(reelxCore.notify);
  };

  const a = reelxCore(0);
  let calls = 0;
  a.subscribe(() => calls++);

  expect(calls).toBe(1);

  a(123);
  await Promise.resolve();
  expect(calls).toBe(1);
  await new Promise((r) => setTimeout(r));
  expect(calls).toBe(2);
});
