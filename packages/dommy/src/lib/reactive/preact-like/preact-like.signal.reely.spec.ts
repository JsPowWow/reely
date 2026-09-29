// What reely's signals guarantee beyond the tests ported from Preact: the contract any core under them keeps.
import { batch, computed, effect, signal } from './preact-like.signal';
import { reelxDebug } from '../reelx/reelx.core';

describe('the signal contract', () => {
  it('runs the effects of a signal in the order they were created', () => {
    const lap = signal(0);
    const order: string[] = [];
    effect(() => void order.push(`a${lap.value}`));
    effect(() => void order.push(`b${lap.value}`));
    effect(() => void order.push(`c${lap.value}`));

    lap.value = 1;

    expect(order).toStrictEqual(['a0', 'b0', 'c0', 'a1', 'b1', 'c1']);
  });

  it('runs what an effect writes before the outer write returns', () => {
    const lap = signal(0);
    const best = signal(0);
    const seen: number[] = [];
    effect(() => {
      if (lap.value > best.peek()) {
        best.value = lap.value;
      }
    });
    effect(() => void seen.push(best.value));

    lap.value = 3;

    expect(seen).toStrictEqual([0, 3]);
  });

  it('never shows an effect a signal and its computed out of step', () => {
    const lap = signal(1);
    const double = computed(() => lap.value * 2);
    const pairs: string[] = [];
    effect(() => void pairs.push(`${lap.value}:${double.value}`));

    lap.value = 2;
    lap.value = 3;

    expect(pairs).toStrictEqual(['1:2', '2:4', '3:6']);
  });

  it('runs an effect once for a batch that writes several of its signals from inside another effect', () => {
    const trigger = signal(0);
    const a = signal(0);
    const b = signal(0);
    const sums: number[] = [];
    effect(() => {
      const next = trigger.value;
      batch(() => {
        a.value = next;
        b.value = next;
      });
    });
    effect(() => void sums.push(a.value + b.value));

    trigger.value = 5;

    expect(sums).toStrictEqual([0, 10]);
  });

  it('keeps working after it stops a cycle of effects', () => {
    const ping = signal(0);
    const pong = signal(0);
    const stopPing = effect(() => void (ping.value = pong.value + 1));

    expect(() => effect(() => void (pong.value = ping.value + 1))).toThrow(/cycle/);
    stopPing();

    const lap = signal(0);
    const seen: number[] = [];
    effect(() => void seen.push(lap.value));
    lap.value = 1;
    expect(seen).toStrictEqual([0, 1]);
  });

  it('reads a chain of a thousand computeds', () => {
    const head = signal(0);
    let last: { readonly value: number } = head;
    for (let i = 0; i < 1000; i++) {
      const previous = last;
      last = computed(() => previous.value + 1);
    }
    const seen: number[] = [];
    effect(() => void seen.push(last.value));

    head.value = 1;

    expect(seen).toStrictEqual([1000, 1001]);
  });

  it('tells a subscriber the new value and the one before it', () => {
    const lap = signal(1);
    const calls: unknown[][] = [];
    lap.subscribe((...args) => void calls.push(args));

    lap.value = 2;
    lap.value = 3;

    expect(calls).toStrictEqual([
      [1, undefined],
      [2, 1],
      [3, 2],
    ]);
  });

  it('tells a subscriber of a computed nothing when the new value is the same by `Object.is`, `NaN` included', () => {
    const lap = signal(1);
    const ratio = computed(() => (lap.value > 0 ? Number.NaN : 0));
    const heard = vi.fn();
    ratio.subscribe(heard);

    lap.value = 2;

    expect(heard).toHaveBeenCalledOnce();
  });

  it('releases every source of a computed chain when its last effect is disposed', () => {
    const lap = signal(1);
    const double = computed(() => lap.value * 2);
    const label = computed(() => `lap ${double.value}`);
    const stop = effect(() => void label.value);

    stop();

    expect([
      reelxDebug(lap).subscriberCount(),
      reelxDebug(double).subscriberCount(),
      reelxDebug(label).subscriberCount(),
    ]).toStrictEqual([0, 0, 0]);
  });
});
