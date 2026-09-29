// What reely's signals guarantee beyond the tests ported from Preact: the contract any core under them keeps.
import { noop } from '@reely/utils';

import { batch, computed, effect, signal, untracked } from './preact-like.signal';
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

  it('keeps running an effect that was waiting when it stopped a cycle', () => {
    const ping = signal(0);
    const pong = signal(0);
    const other = signal(0);
    const spy = vi.fn(() => void (ping.value = pong.value + other.value + 1));
    effect(spy);
    expect(() => effect(() => void (pong.value = ping.value + 1))).toThrow(/cycle/);
    const runs = spy.mock.calls.length;

    other.value = 99;

    expect(spy.mock.calls.length).toBe(runs + 1);
  });

  it('runs an effect again for what an effect nested in it writes on its first run', () => {
    const open = signal(true);
    const seen: boolean[] = [];

    effect(() => {
      seen.push(open.value);
      effect(() => {
        if (open.peek()) {
          open.value = false;
        }
      });
    });

    expect(seen).toStrictEqual([true, false]);
  });

  it('never runs again an effect whose creation threw', () => {
    const s = signal(0);
    const t = signal(0);
    effect(() => void (t.value = s.value + 1));
    const broken = vi.fn(() => {
      t.value;
      s.value = 1;
      throw new Error('broken');
    });

    expect(() => effect(broken)).toThrow('broken');

    expect(broken).toHaveBeenCalledOnce();
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

  it('releases a signal read through a computed that a subscriber and an effect share, once both are gone', () => {
    const lap = signal(0);
    const double = computed(() => lap.value * 2);
    const unsubscribe = double.subscribe(noop); // as a binding does
    const tick = signal(0);
    const stop = effect(() => void (tick.value, double.value));
    lap.value = 1; // the effect reads `double` in the same flush as the subscriber

    stop();
    unsubscribe();

    expect(reelxDebug(lap).subscriberCount()).toBe(0);
  });

  it('subscribes an effect to a computed it peeked before reading', () => {
    const lap = signal(1);
    const double = computed(() => lap.value * 2);
    const seen: number[] = [];
    effect(() => {
      double.peek();
      seen.push(double.value);
    });

    lap.value = 2;

    expect(seen).toStrictEqual([2, 4]);
  });

  it('runs a subscriber callback untracked', () => {
    const lap = signal(1);
    const other = signal(0);
    const heard = vi.fn((value: number) => value + other.value);
    lap.subscribe(heard);

    other.value = 1;

    expect(heard).toHaveBeenCalledOnce();
  });

  it('tells a subscriber nothing at once when the value is `undefined`, then every change', () => {
    const lap = signal<number | undefined>(undefined);
    const calls: unknown[][] = [];
    lap.subscribe((...args) => void calls.push(args));

    lap.value = 1;

    expect(calls).toStrictEqual([[1, undefined]]);
  });

  it("runs the effects an effect's first run triggers after that run", () => {
    const lap = signal(0);
    const order: string[] = [];
    effect(() => void order.push(`watch ${lap.value}`));

    effect(() => {
      order.push('start');
      lap.value = 1;
      order.push('end');
    });

    expect(order).toStrictEqual(['watch 0', 'start', 'end', 'watch 1']);
  });

  it('prints the current value of a computed', () => {
    const lap = signal(1);
    const label = computed(() => `lap ${lap.value}`);
    expect(String(label)).toBe('lap 1');

    lap.value = 2;

    expect([String(label), `${label}`, JSON.stringify({ label })]).toStrictEqual([
      'lap 2',
      'lap 2',
      '{"label":"lap 2"}',
    ]);
  });

  it('does not run an effect again for what its own run writes, untracked too', () => {
    const lap = signal(0);
    const spy = vi.fn(() => {
      lap.value;
      untracked(() => (lap.value = lap.peek() + 1));
    });

    effect(spy);

    expect([spy.mock.calls.length, lap.peek()]).toStrictEqual([1, 1]);
  });

  it('runs once an effect that writes a signal it read through a computed', () => {
    const lap = signal(0);
    const next = computed(() => lap.value + 1);
    const spy = vi.fn(() => {
      if (next.value < 3) {
        lap.value = next.value;
      }
    });

    effect(spy);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('leaves nothing subscribed when an effect is created into a cycle', () => {
    const ping = signal(0);
    const pong = signal(0);
    const stop = effect(() => void (ping.value = pong.value + 1));
    expect(() => effect(() => void (pong.value = ping.value + 1))).toThrow(/cycle/);

    stop();

    expect([reelxDebug(ping).subscriberCount(), reelxDebug(pong).subscriberCount()]).toStrictEqual([0, 0]);
  });

  it('runs an effect once per write and once per batch', () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn(() => void (a.value + b.value));
    effect(spy);

    a.value = 1;
    batch(() => {
      a.value = 2;
      b.value = 2;
    });

    expect(spy).toHaveBeenCalledTimes(3);
  });

  describe('an effect that writes a signal it read', () => {
    it('does not see later writes of it (README, Self-referencing in effects)', () => {
      const laps = signal(0);
      const spy = vi.fn(() => {
        if (laps.value > 10) {
          laps.value = 10;
        }
      });
      effect(spy);

      laps.value = 20;
      laps.value = 30;

      expect([spy.mock.calls.length, laps.value]).toStrictEqual([2, 30]);
    });

    it('still hears the other signals of a computed it read', () => {
      const a = signal(0);
      const b = signal(0);
      const sum = computed(() => a.value + b.value);
      const spy = vi.fn(() => {
        if (sum.value > 10) {
          a.value = 0;
        }
      });
      effect(spy);

      a.value = 20;
      b.value = 1;

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('does not see them either when it read the signal through a computed', () => {
      const laps = signal(0);
      const read = computed(() => laps.value);
      const spy = vi.fn(() => {
        if (read.value > 10) {
          laps.value = 10;
        }
      });
      effect(spy);

      laps.value = 20;
      laps.value = 30;

      expect([spy.mock.calls.length, laps.value]).toStrictEqual([2, 30]);
    });
  });
});
