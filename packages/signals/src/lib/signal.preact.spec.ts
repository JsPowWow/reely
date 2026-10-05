// Adapted from the tests of @preact/signals-core (https://github.com/preactjs/signals),
// Copyright (c) 2022-present Preact Team, MIT licence.
// Not adapted: `createModel`, `watched`/`unwatched`, disposal with `using`, `instanceof Signal`, the
// Symbol brands and the internals (`_start`, `_sources`, `_callback`): API this package does not have.
import { onCleanup } from './owner';
import { subscriberCount } from './reelx.core';
import { batch, computed, type Computed, effect, signal, type Signal, subscribe, untracked } from './signal';

describe('signal', () => {
  it('should return value', () => {
    const v = [1, 2];
    const s = signal(v);

    expect(s.value).toBe(v);
  });

  it('should support .toString()', () => {
    const s = signal(123);
    expect(s.toString()).toBe('123');
  });

  // `.toJSON()` stays off the type: this is upstream's `.toJSON()` test
  it('should support JSON.Stringify()', () => {
    const s = signal(123);
    expect(JSON.stringify({ s })).toBe(JSON.stringify({ s: 123 }));
  });

  it('should support .valueOf()', () => {
    const s = signal(123);
    expect(s).to.have.property('valueOf');
    expect(s.valueOf).to.be.a('function');
    expect(s.valueOf()).toBe(123);
    expect(+s).toBe(123);

    const a = signal(1);
    const b = signal(2);
    // @ts-expect-error-next-line
    expect(a + b).toBe(3);
  });

  it('should notify other listeners of changes after one listener is disposed', () => {
    const s = signal(0);
    const spy1 = vi.fn(() => {
      s.value;
    });
    const spy2 = vi.fn(() => {
      s.value;
    });
    const spy3 = vi.fn(() => {
      s.value;
    });

    effect(spy1);
    const dispose = effect(spy2);
    effect(spy3);

    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
    expect(spy3).toHaveBeenCalledOnce();

    dispose();

    s.value = 1;
    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalledOnce();
    expect(spy3).toHaveBeenCalledTimes(2);
  });

  it('should hold a function as a value, never calling it', () => {
    const first = vi.fn();
    const second = vi.fn();
    const handler = signal(first);

    handler.value = second;

    expect(handler.value).toBe(second);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });

  it('should not make an effect depend on a signal it writes an equal value to', () => {
    const laps = signal(0);
    const spy = vi.fn(() => {
      laps.value = laps.peek();
    });
    effect(spy);

    laps.value = 10;

    expect(spy).toHaveBeenCalledOnce();
  });

  describe('.set() and .update(), as in Angular', () => {
    it('should write as `.value =` does, an equal value changing nothing', () => {
      const laps = signal(0);
      const double = computed(() => laps() * 2);
      const seen: number[] = [];
      effect(() => void seen.push(double()));

      laps.set(1);
      laps.set(1);
      laps.update((n) => n + 1);

      expect(seen).toStrictEqual([0, 2, 4]);
    });

    it('should hold a function given to `set` as a value, never calling it', () => {
      const first = vi.fn();
      const second = vi.fn();
      const handler = signal(first);

      handler.set(second);

      expect(handler()).toBe(second);
      expect(second).not.toHaveBeenCalled();
    });

    it('should not make the effect that updates a signal depend on it, even when nothing changes', () => {
      const laps = signal(0);
      const spy = vi.fn(() => laps.update((n) => n));
      effect(spy);

      laps.set(10);

      expect(spy).toHaveBeenCalledOnce();
    });

    it('should hand `update` a held function as the value, never calling it', () => {
      const first = vi.fn();
      const handler = signal(first);

      handler.update((held) => (held === first ? vi.fn() : held));

      expect(handler()).not.toBe(first);
      expect(first).not.toHaveBeenCalled();
    });
  });

  describe('.peek()', () => {
    it('should get value', () => {
      const s = signal(1);
      expect(s.peek()).toBe(1);
    });

    it('should get the updated value after a value change', () => {
      const s = signal(1);
      s.value = 2;
      expect(s.peek()).toBe(2);
    });
    it('should not make surrounding effect depend on the signal', () => {
      const s = signal(1);
      const spy = vi.fn(() => {
        s.peek();
      });

      effect(spy);
      expect(spy).toHaveBeenCalledOnce();

      s.value = 2;
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should not make surrounding computed depend on the signal', () => {
      const s = signal(1);
      const spy = vi.fn(() => {
        s.peek();
      });
      const d = computed(spy);

      d.value;
      expect(spy).toHaveBeenCalledOnce();

      s.value = 2;
      d.value;
      expect(spy).toHaveBeenCalledOnce();
    });
  });
  describe('subscribe()', () => {
    it('should subscribe to a signal', () => {
      const spy = vi.fn();
      const a = signal(1);

      subscribe(a, spy);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should run the callback when the signal value changes', () => {
      const spy = vi.fn();
      const a = signal(1);

      subscribe(a, spy);
      expect(spy).toHaveBeenNthCalledWith(1, 1);
      a.value = 2;
      expect(spy).toHaveBeenNthCalledWith(2, 2);
    });

    it('should unsubscribe from a signal', () => {
      const spy = vi.fn();
      const a = signal(1);

      const dispose = subscribe(a, spy);
      dispose();
      spy.mockClear();

      a.value = 2;
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not start triggering on when a signal accessed in the callback changes', () => {
      const spy = vi.fn();
      const a = signal(0);
      const b = signal(0);

      subscribe(a, () => {
        b.value;
        spy();
      });
      expect(spy).toHaveBeenCalledOnce();
      spy.mockClear();

      b.value++;
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not cause surrounding effect to subscribe to changes to a signal accessed in the callback', () => {
      const spy = vi.fn();
      const a = signal(0);
      const b = signal(0);

      effect(() => {
        subscribe(a, () => {
          b.value;
        });
        spy();
      });
      expect(spy).toHaveBeenCalledOnce();
      spy.mockClear();

      b.value++;
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

describe('effect()', () => {
  it('should release what its first run created when that run throws', () => {
    const lap = signal(0);

    expect(() =>
      effect(() => {
        effect(() => lap.value);
        throw new Error('first run');
      })
    ).toThrow('first run');
    expect(subscriberCount(lap)).toBe(0);
  });

  it('should dispose the effect when a cleanup throws, running its other cleanups', () => {
    const a = signal(0);
    const lap = signal(0);
    const released = vi.fn();
    const spy = vi.fn();

    effect(() => {
      spy(a.value);
      effect(() => lap.value);
      onCleanup(released);
      onCleanup(() => {
        throw new Error('cleanup');
      });
    });

    expect(() => (a.value = 1)).toThrow('cleanup');
    expect(released).toHaveBeenCalledOnce();
    expect(subscriberCount(lap)).toBe(0);
    expect(subscriberCount(a)).toBe(0);
    a.value = 2;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should run the callback immediately', () => {
    const s = signal(123);
    const spy = vi.fn(() => {
      s.value;
    });
    effect(spy);
    expect(spy).toHaveBeenCalled();
  });

  it('should subscribe to signals', () => {
    const s = signal(123);
    const spy = vi.fn(() => {
      s.value;
    });
    effect(spy);
    spy.mockClear();

    s.value = 42;
    expect(spy).toHaveBeenCalled();
  });
  it('should subscribe to multiple signals', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      a.value;
      b.value;
    });
    effect(spy);
    spy.mockClear();

    a.value = 'aa';
    b.value = 'bb';
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should dispose of subscriptions', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      return a.value + ' ' + b.value;
    });
    const dispose = effect(spy);
    spy.mockClear();

    dispose();
    expect(spy).not.toHaveBeenCalled();

    a.value = 'aa';
    b.value = 'bb';
    expect(spy).not.toHaveBeenCalled();
  });

  it('should dispose of subscriptions #2', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      return a.value + ' ' + b.value;
    });
    effect(function (this: { dispose: () => void }) {
      spy();
      if (a.value === 'aa') {
        this.dispose();
      }
    });

    expect(spy).toHaveBeenCalled();

    a.value = 'aa';
    expect(spy).toHaveBeenCalledTimes(2);

    a.value = 'aaa';
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should dispose of subscriptions immediately', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      a.value + ' ' + b.value;
    });
    effect(function (this: { dispose: () => void }) {
      spy();
      this.dispose();
    });

    expect(spy).toHaveBeenCalledOnce();

    a.value = 'aa';
    expect(spy).toHaveBeenCalledOnce();

    a.value = 'aaa';
    expect(spy).toHaveBeenCalledOnce();
  });
  it('should dispose of subscriptions when called twice', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      return a.value + ' ' + b.value;
    });
    const dispose = effect(function (this: { dispose: () => void }) {
      spy();
      if (a.value === 'aa') {
        this.dispose();
      }
    });

    expect(spy).toHaveBeenCalled();
    a.value = 'aa';
    expect(spy).toHaveBeenCalledTimes(2);
    dispose();
    a.value = 'aaa';
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should dispose of subscriptions immediately and signals are read after disposing', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      a.value + ' ' + b.value;
    });
    effect(function (this: { dispose: () => void }) {
      this.dispose();
      spy();
    });

    expect(spy).toHaveBeenCalledOnce();

    a.value = 'aa';
    expect(spy).toHaveBeenCalledOnce();

    a.value = 'aaa';
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should dispose of subscriptions immediately when called twice (deferred)', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      a.value + ' ' + b.value;
    });
    const dispose = effect(function (this: { dispose: () => void }) {
      spy();
      this.dispose();
    });

    expect(spy).toHaveBeenCalledOnce();

    a.value = 'aa';
    expect(spy).toHaveBeenCalledOnce();
    dispose();

    a.value = 'aaa';
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should unsubscribe from signal', () => {
    const s = signal(123);
    const spy = vi.fn(() => {
      s.value;
    });
    const unsub = effect(spy);
    spy.mockClear();

    unsub();
    s.value = 42;
    expect(spy).not.toHaveBeenCalled();
  });

  it('should conditionally unsubscribe from signals', () => {
    const a = signal('a');
    const b = signal('b');
    const cond = signal(true);

    const spy = vi.fn(() => {
      cond.value ? a.value : b.value;
    });

    effect(spy);
    expect(spy).toHaveBeenCalledOnce();

    b.value = 'bb';
    expect(spy).toHaveBeenCalledOnce();

    cond.value = false;
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockClear();

    a.value = 'aaa';
    expect(spy).not.toHaveBeenCalled();
  });

  it('should batch writes', () => {
    const a = signal('a');
    const spy = vi.fn(() => {
      a.value;
    });
    effect(spy);
    spy.mockClear();

    effect(() => {
      a.value = 'aa';
      a.value = 'aaa';
    });
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should run the cleanup registered with onCleanup before the next run', () => {
    const a = signal(0);
    const spy = vi.fn();

    effect(() => {
      a.value;
      onCleanup(spy);
    });
    expect(spy).not.toHaveBeenCalled();
    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
    a.value = 2;
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should run only the cleanup from the previous run', () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    const spy3 = vi.fn();
    const a = signal(spy1);

    effect(() => {
      onCleanup(a.value);
    });

    expect(spy1).not.toHaveBeenCalled();
    a.value = spy2;
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).not.toHaveBeenCalled();
    a.value = spy3;
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
    expect(spy3).not.toHaveBeenCalled();
  });

  it('should run the cleanup when disposed', () => {
    const spy = vi.fn();

    const dispose = effect(() => {
      onCleanup(spy);
    });
    expect(spy).not.toHaveBeenCalled();
    dispose();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should dispose an effect created in the previous run', () => {
    const outer = signal(0);
    const inner = signal(0);
    const spy = vi.fn();

    effect(() => {
      outer.value;
      effect(() => spy(inner.value));
    });
    outer.value = 1;
    outer.value = 2;
    spy.mockClear();
    inner.value = 1;

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should dispose the effects created in its runs when disposed', () => {
    const outer = signal(0);
    const inner = signal(0);
    const spy = vi.fn();

    const dispose = effect(() => {
      outer.value;
      effect(() => spy(inner.value));
    });
    outer.value = 1;
    dispose();
    spy.mockClear();
    inner.value = 1;

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not recompute if the effect has been notified about changes, but no direct dependency has actually changed', () => {
    const s = signal(0);
    const c = computed(() => {
      s.value;
      return 0;
    });
    const spy = vi.fn(() => {
      c.value;
    });
    effect(spy);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    s.value = 1;
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not recompute dependencies unnecessarily', () => {
    const spy = vi.fn();
    const a = signal(0);
    const b = signal(0);
    const c = computed(() => {
      b.value;
      spy();
    });
    effect(() => {
      if (a.value === 0) {
        c.value;
      }
    });
    expect(spy).toHaveBeenCalledOnce();

    batch(() => {
      b.value = 1;
      a.value = 1;
    });
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not recompute dependencies out of order', () => {
    const a = signal(1);
    const b = signal(1);
    const c = signal(1);

    const spy = vi.fn(() => c.value);
    const d = computed(spy);

    effect(() => {
      if (a.value > 0) {
        b.value;
        d.value;
      } else {
        b.value;
      }
    });
    spy.mockClear();

    batch(() => {
      a.value = 2;
      b.value = 2;
      c.value = 2;
    });
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    batch(() => {
      a.value = -1;
      b.value = -1;
      c.value = -1;
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockClear();
  });

  it('does not recompute for a dependency it changes itself (preact runs it twice)', () => {
    const a = signal(0);
    const spy = vi.fn(() => {
      if (a.value === 0) {
        a.value++;
      }
    });
    effect(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // preact throws "Cycle detected" for these two: here a run does not depend on what it writes
  it('settles, not cycles, when an effect writes a signal it reads (preact throws)', () => {
    const a = signal(0);
    let i = 0;

    effect(() => {
      if (i++ > 200) {
        throw new Error('test failed');
      }
      a.value;
      a.value = Number.NaN;
    });

    expect(i).toBe(1);
  });

  it('settles, not cycles, when a computed an effect reads writes a signal it reads (preact throws)', () => {
    const a = signal(0);
    let i = 0;
    const c = computed(() => {
      a.value;
      a.value = Number.NaN;
      return Number.NaN;
    });

    effect(() => {
      if (i++ > 200) {
        throw new Error('test failed');
      }
      c.value;
    });

    expect(i).toBe(1);
  });

  it('should run the cleanup in an implicit batch', () => {
    const a = signal(0);
    const b = signal('a');
    const c = signal('b');
    const spy = vi.fn();

    effect(() => {
      spy(b.value + c.value);
    });

    effect(() => {
      a.value;
      onCleanup(() => {
        b.value = 'x';
        c.value = 'y';
      });
    });

    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('xy');
  });

  it('should not retrigger the effect if the cleanup modifies one of the dependencies', () => {
    const a = signal(0);
    const spy = vi.fn();

    effect(() => {
      spy(a.value);
      onCleanup(() => {
        a.value = 2;
      });
    });
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should run the cleanup if the effect disposes itself', () => {
    const a = signal(0);
    const spy = vi.fn();

    const dispose = effect(() => {
      if (a.value > 0) {
        dispose();
        onCleanup(spy);
      }
    });
    expect(spy).not.toHaveBeenCalled();
    a.value = 1;

    expect(spy).toHaveBeenCalledOnce();
    a.value = 2;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not run the effect if the cleanup disposes it', () => {
    const a = signal(0);
    const spy = vi.fn();

    const dispose = effect(() => {
      a.value;
      spy();
      onCleanup(() => {
        dispose();
      });
    });
    expect(spy).toHaveBeenCalledOnce();
    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not subscribe to anything if first run throws', () => {
    const s = signal(0);
    const spy = vi.fn(() => {
      s.value;
      throw new Error('test');
    });
    expect(() => effect(spy)).toThrow('test');
    expect(spy).toHaveBeenCalledOnce();

    s.value++;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should run the cleanup registered before the effect threw', () => {
    const a = signal(0);
    const spy = vi.fn();

    effect(() => {
      if (a.value === 0) {
        onCleanup(spy);
      } else {
        throw new Error('hello');
      }
    });
    expect(spy).not.toHaveBeenCalled();
    expect(() => (a.value = 1)).toThrow('hello');
    expect(spy).toHaveBeenCalledOnce();
    a.value = 0;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should run cleanups outside any evaluation context', () => {
    const spy = vi.fn();
    const a = signal(0);
    const b = signal(0);
    const c = computed(() => {
      if (a.value === 0) {
        effect(() => {
          onCleanup(() => {
            b.value;
          });
        });
      }
      return a.value;
    });

    effect(() => {
      spy();
      c.value;
    });
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    b.value = 1;
    expect(spy).not.toHaveBeenCalled();
  });

  it('should allow disposing the effect multiple times', () => {
    const dispose = effect(() => undefined);
    dispose();
    expect(() => dispose()).not.toThrow();
  });

  it('should allow disposing a running effect', () => {
    const a = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      if (a.value === 1) {
        dispose();
        spy();
      }
    });
    expect(spy).not.toHaveBeenCalled();
    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
    a.value = 2;
    expect(spy).toHaveBeenCalledOnce();
  });
  it("should not run if it's first been triggered and then disposed in a batch", () => {
    const a = signal(0);
    const spy = vi.fn(() => {
      a.value;
    });
    const dispose = effect(spy);
    spy.mockClear();

    batch(() => {
      a.value = 1;
      dispose();
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should not run if it's been triggered, disposed and then triggered again in a batch", () => {
    const a = signal(0);
    const spy = vi.fn(() => {
      a.value;
    });
    const dispose = effect(spy);
    spy.mockClear();

    batch(() => {
      a.value = 1;
      dispose();
      a.value = 2;
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should not rerun parent effect if a nested child effect's signal's value changes", () => {
    const parentSignal = signal(0);
    const childSignal = signal(0);

    const parentEffect = vi.fn(() => {
      parentSignal.value;
    });
    const childEffect = vi.fn(() => {
      childSignal.value;
    });

    effect(() => {
      parentEffect();
      effect(childEffect);
    });

    expect(parentEffect).toHaveBeenCalledOnce();
    expect(childEffect).toHaveBeenCalledOnce();

    childSignal.value = 1;
    expect(parentEffect).toHaveBeenCalledOnce();
    expect(childEffect).toHaveBeenCalledTimes(2);

    parentSignal.value = 1;
    expect(parentEffect).toHaveBeenCalledTimes(2);
    expect(childEffect).toHaveBeenCalledTimes(3);
  });
});

describe('computed', () => {
  it('should return value', () => {
    const a = signal('a');
    const b = signal('b');
    const c = computed(() => a.value + b.value);
    expect(c.value).toBe('ab');
  });

  it('should return updated value', () => {
    const a = signal('a');
    const b = signal('b');

    const c = computed(() => a.value + b.value);
    expect(c.value).toBe('ab');

    a.value = 'aa';
    expect(c.value).toBe('aab');
  });

  it('should be lazily computed on demand', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => a.value + b.value);
    const c = computed(spy);
    expect(spy).not.toHaveBeenCalled();
    c.value;
    expect(spy).toHaveBeenCalledOnce();
    a.value = 'x';
    b.value = 'y';
    expect(spy).toHaveBeenCalledOnce();
    c.value;
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should be computed only when a dependency has changed at some point', () => {
    const a = signal('a');
    const spy = vi.fn(() => {
      return a.value;
    });
    const c = computed(spy);
    c.value;
    expect(spy).toHaveBeenCalledOnce();
    a.value = 'a';
    c.value;
    expect(spy).toHaveBeenCalledOnce();
  });

  // preact recomputes it: a run does not depend on a signal it writes, as for an effect
  it('does not recompute for a dependency it changes itself (preact recomputes it)', () => {
    const a = signal(0);
    const spy = vi.fn(() => {
      a.value++;
    });
    const c = computed(spy);
    c.value;
    expect(spy).toHaveBeenCalledOnce();
    c.value;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should detect simple dependency cycles', () => {
    const a: Computed<number> = computed(() => a.value);
    expect(() => a.value).toThrow(/cycle/);
  });

  it('should detect deep dependency cycles', () => {
    const a: Computed<number> = computed(() => b.value);
    const b: Computed<number> = computed(() => c.value);
    const c: Computed<number> = computed(() => d.value);
    const d: Computed<number> = computed(() => a.value);
    expect(() => a.value).toThrow(/cycle/);
  });

  it('should not allow a computed signal to become a direct dependency of itself', () => {
    const spy = vi.fn(() => {
      try {
        a.value;
      } catch {
        // pass
      }
    });
    const a: Computed<void> = computed(spy);
    a.value;
    expect(() => effect(() => a.value)).not.toThrow();
  });

  it('should detect a cycle that forms after the first computation', () => {
    const closed = signal(false);
    const b: Computed<number> = computed(() => (closed.value ? a.value : 0));
    const a: Computed<number> = computed(() => b.value + 1);
    effect(() => void a.value);

    expect(() => (closed.value = true)).toThrow(/cycle/);
    expect(() => b.value).toThrow(/cycle/);
  });

  it('should not keep a stale value in a computed a cycle broke off mid-check', () => {
    const closed = signal(false);
    const a: Computed<number> = computed(() => b.value + 1);
    const b: Computed<number> = computed(() => (closed.value ? a.value : 0));
    expect(a.value).toBe(1);

    closed.value = true;

    expect(() => b.value).toThrow(/cycle/);
    expect(() => a.value).toThrow(/cycle/);
  });

  it('should store thrown errors and recompute only after a dependency changes', () => {
    const a = signal(0);
    const spy = vi.fn(() => {
      a.value;
      throw new Error('Test error');
    });
    const c = computed(spy);

    expect(() => c.value).toThrow('Test error');
    expect(() => c.value).toThrow('Test error');
    expect(spy).toHaveBeenCalledOnce();
    a.value = 1;
    expect(() => c.value).toThrow('Test error');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should store thrown non-errors and recompute only after a dependency changes', () => {
    const a = signal(0);
    const spy = vi.fn();
    const c = computed(() => {
      a.value;
      spy();
      throw undefined;
    });

    try {
      c.value;
      expect.fail();
    } catch (err) {
      expect(err).to.be.undefined;
    }
    try {
      c.value;
      expect.fail();
    } catch (err) {
      expect(err).to.be.undefined;
    }
    expect(spy).toHaveBeenCalledOnce();

    a.value = 1;
    try {
      c.value;
      expect.fail();
    } catch (err) {
      expect(err).to.be.undefined;
    }
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should conditionally unsubscribe from signals', () => {
    const a = signal('a');
    const b = signal('b');
    const cond = signal(true);

    const spy = vi.fn(() => {
      return cond.value ? a.value : b.value;
    });

    const c = computed(spy);
    expect(c.value).toBe('a');
    expect(spy).toHaveBeenCalledOnce();

    b.value = 'bb';
    expect(c.value).toBe('a');
    expect(spy).toHaveBeenCalledOnce();

    cond.value = false;
    expect(c.value).toBe('bb');
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockClear();

    a.value = 'aaa';
    expect(c.value).toBe('bb');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should consider undefined value separate from uninitialized value', () => {
    const a = signal(0);
    const spy = vi.fn(() => undefined);
    const c = computed(spy);

    expect(c.value).to.be.undefined;
    a.value = 1;
    expect(c.value).to.be.undefined;
    expect(spy).toHaveBeenCalledOnce();
  });
  it('should not leak errors raised by dependencies', () => {
    const a = signal(0);
    const b = computed(() => {
      a.value;
      throw new Error('error');
    });
    const c = computed(() => {
      try {
        b.value;
      } catch {
        return 'ok';
      }
      return expect.fail();
    });
    expect(c.value).toBe('ok');
    a.value = 1;
    expect(c.value).toBe('ok');
  });

  it('should recompute when a dependency stops throwing, even with its old value', () => {
    const a = signal(0);
    const b = computed(() => {
      if (a.value === 1) {
        throw new Error('error');
      }
      return 0;
    });
    const c = computed(() => {
      try {
        return b.value;
      } catch {
        return 'failed';
      }
    });

    expect(c.value).toBe(0);
    a.value = 1;
    expect(c.value).toBe('failed');
    a.value = 2;
    expect(c.value).toBe(0);
  });

  it('should propagate notifications even right after first subscription', () => {
    const a = signal(0);
    const b = computed(() => a.value);
    const c = computed(() => b.value);
    c.value;

    const spy = vi.fn(() => {
      c.value;
    });

    effect(spy);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    a.value = 1;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should get marked as outdated right after first subscription', () => {
    const s = signal(0);
    const c = computed(() => s.value);
    c.value;

    s.value = 1;
    effect(() => {
      c.value;
    });
    expect(c.value).toBe(1);
  });

  it('should propagate notification to other listeners after one listener is disposed', () => {
    const s = signal(0);
    const c = computed(() => s.value);

    const spy1 = vi.fn(() => {
      c.value;
    });
    const spy2 = vi.fn(() => {
      c.value;
    });
    const spy3 = vi.fn(() => {
      c.value;
    });

    effect(spy1);
    const dispose = effect(spy2);
    effect(spy3);

    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
    expect(spy3).toHaveBeenCalledOnce();

    dispose();

    s.value = 1;
    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalledOnce();
    expect(spy3).toHaveBeenCalledTimes(2);
  });

  it('should not recompute dependencies out of order', () => {
    const a = signal(1);
    const b = signal(1);
    const c = signal(1);

    const spy = vi.fn(() => c.value);
    const d = computed(spy);

    const e = computed(() => {
      if (a.value > 0) {
        b.value;
        d.value;
      } else {
        b.value;
      }
    });

    e.value;
    spy.mockClear();

    a.value = 2;
    b.value = 2;
    c.value = 2;
    e.value;
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    a.value = -1;
    b.value = -1;
    c.value = -1;
    e.value;
    expect(spy).not.toHaveBeenCalled();
    spy.mockClear();
  });

  it('should not recompute dependencies unnecessarily', () => {
    const spy = vi.fn();
    const a = signal(0);
    const b = signal(0);
    const c = computed(() => {
      b.value;
      spy();
    });
    const d = computed(() => {
      if (a.value === 0) {
        c.value;
      }
    });
    d.value;
    expect(spy).toHaveBeenCalledOnce();

    batch(() => {
      b.value = 1;
      a.value = 1;
    });

    d.value;
    expect(spy).toHaveBeenCalledOnce();
  });

  describe('.peek()', () => {
    it('should detect simple dependency cycles', () => {
      const a: Computed<number> = computed(() => a.peek());
      expect(() => a.peek()).toThrow(/cycle/);
    });

    it('should detect deep dependency cycles', () => {
      const a: Computed<number> = computed(() => b.value);
      const b: Computed<number> = computed(() => c.value);
      const c: Computed<number> = computed(() => d.value);
      const d: Computed<number> = computed(() => a.peek());
      expect(() => a.peek()).toThrow(/cycle/);
    });

    it('should get value', () => {
      const s = signal(1);

      const c = computed(() => s.value);

      expect(c.peek()).toBe(1);
    });
    it('should throw when evaluation throws', () => {
      const c = computed(() => {
        throw Error('test');
      });
      expect(() => c.peek()).toThrow('test');
    });

    it("should throw when previous evaluation threw and dependencies haven't changed", () => {
      const c = computed(() => {
        throw Error('test');
      });
      expect(() => c.value).toThrow('test');
      expect(() => c.peek()).toThrow('test');
    });

    it('should refresh value if stale', () => {
      const a = signal(1);
      const b = computed(() => a.value);
      expect(b.peek()).toBe(1);

      a.value = 2;
      expect(b.peek()).toBe(2);
    });

    it('should not make surrounding effect depend on the computed', () => {
      const s = signal(1);
      const c = computed(() => s.value);
      const spy = vi.fn(() => {
        c.peek();
      });

      effect(spy);
      expect(spy).toHaveBeenCalledOnce();

      s.value = 2;
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should not make surrounding computed depend on the computed', () => {
      const s = signal(1);
      const c = computed(() => s.value);

      const spy = vi.fn(() => {
        c.peek();
      });

      const d = computed(spy);
      d.value;
      expect(spy).toHaveBeenCalledOnce();

      s.value = 2;
      d.value;
      expect(spy).toHaveBeenCalledOnce();
    });

    it("should not make surrounding effect depend on the peeked computed's dependencies", () => {
      const a = signal(1);
      const b = computed(() => a.value);
      const spy = vi.fn();
      effect(() => {
        spy();
        b.peek();
      });
      expect(spy).toHaveBeenCalledOnce();
      spy.mockClear();

      a.value = 1;
      expect(spy).not.toHaveBeenCalled();
    });

    it("should not make surrounding computed depend on peeked computed's dependencies", () => {
      const a = signal(1);
      const b = computed(() => a.value);
      const spy = vi.fn();
      const d = computed(() => {
        spy();
        b.peek();
      });
      d.value;
      expect(spy).toHaveBeenCalledOnce();
      spy.mockClear();

      a.value = 1;
      d.value;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe.runIf(typeof gc !== 'undefined')('garbage collection', function () {
    it('should be garbage collectable if nothing is listening to its changes', async () => {
      const s = signal(0);
      const ref = new WeakRef(computed(() => s.value));

      (gc as () => void)();
      await new Promise((resolve) => setTimeout(resolve, 0));
      (gc as () => void)();
      expect(ref.deref()).to.be.undefined;
    });

    it('should be garbage collectable after it has lost all of its listeners', async () => {
      const s = signal(0);

      // the computed is only reachable from inside this scope and from the effect
      const { ref, dispose } = (() => {
        const c = computed(() => s.value);
        return {
          ref: new WeakRef(c),
          dispose: effect(() => {
            c.value;
          }),
        };
      })();

      dispose();

      (gc as () => void)();
      await new Promise((resolve) => setTimeout(resolve, 0));
      (gc as () => void)();
      expect(ref.deref()).to.be.undefined;
    });
  });

  describe('graph updates', () => {
    it('should run computeds once for multiple dep changes', async () => {
      const a = signal('a');
      const b = signal('b');

      const compute = vi.fn(() => {
        return a.value + b.value;
      });
      const c = computed(compute);

      expect(c.value).toBe('ab');
      expect(compute).toHaveBeenCalledOnce();
      compute.mockClear();

      a.value = 'aa';
      b.value = 'bb';
      c.value;
      expect(compute).toHaveBeenCalledOnce();
    });

    it('should drop A->B->A updates', async () => {
      //     A
      //   / |
      //  B  | <- Looks like a flag doesn't it? :D
      //   \ |
      //     C
      //     |
      //     D
      const a = signal(2);

      const b = computed(() => a.value - 1);
      const c = computed(() => a.value + b.value);

      const compute = vi.fn(() => 'd: ' + c.value);
      const d = computed(compute);

      expect(d.value).toBe('d: 3');
      expect(compute).toHaveBeenCalledOnce();
      compute.mockClear();

      a.value = 4;
      d.value;
      expect(compute).toHaveBeenCalledOnce();
    });

    it('should only update every signal once (diamond graph)', () => {
      // In this scenario "D" should only update once when "A" receives
      // an update. This is sometimes referred to as the "diamond" scenario.
      //     A
      //   /   \
      //  B     C
      //   \   /
      //     D
      const a = signal('a');
      const b = computed(() => a.value);
      const c = computed(() => a.value);

      const spy = vi.fn(() => b.value + ' ' + c.value);
      const d = computed(spy);

      expect(d.value).toBe('a a');
      expect(spy).toHaveBeenCalledOnce();

      a.value = 'aa';
      expect(d.value).toBe('aa aa');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should only update every signal once (diamond graph + tail)', () => {
      // "E" will be likely updated twice if our mark+sweep logic is buggy.
      //     A
      //   /   \
      //  B     C
      //   \   /
      //     D
      //     |
      //     E
      const a = signal('a');
      const b = computed(() => a.value);
      const c = computed(() => a.value);

      const d = computed(() => b.value + ' ' + c.value);

      const spy = vi.fn(() => d.value);
      const e = computed(spy);

      expect(e.value).toBe('a a');
      expect(spy).toHaveBeenCalledOnce();

      a.value = 'aa';
      expect(e.value).toBe('aa aa');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should bail out if result is the same', () => {
      // Bail out if value of "B" never changes
      // A->B->C
      const a = signal('a');
      const b = computed(() => {
        a.value;
        return 'foo';
      });

      const spy = vi.fn(() => b.value);
      const c = computed(spy);

      expect(c.value).toBe('foo');
      expect(spy).toHaveBeenCalledOnce();

      a.value = 'aa';
      expect(c.value).toBe('foo');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should only update every signal once (jagged diamond graph + tails)', () => {
      // "F" and "G" will be likely updated twice if our mark+sweep logic is buggy.
      //     A
      //   /   \
      //  B     C
      //  |     |
      //  |     D
      //   \   /
      //     E
      //   /   \
      //  F     G
      const a = signal('a');

      const b = computed(() => a.value);
      const c = computed(() => a.value);

      const d = computed(() => c.value);

      const eSpy = vi.fn(() => b.value + ' ' + d.value);
      const e = computed(eSpy);

      const fSpy = vi.fn(() => e.value);
      const f = computed(fSpy);
      const gSpy = vi.fn(() => e.value);
      const g = computed(gSpy);

      expect(f.value).toBe('a a');
      expect(fSpy).toHaveBeenCalledOnce();

      expect(g.value).toBe('a a');
      expect(gSpy).toHaveBeenCalledOnce();

      eSpy.mockClear();
      fSpy.mockClear();
      gSpy.mockClear();

      a.value = 'b';

      expect(e.value).toBe('b b');
      expect(eSpy).toHaveBeenCalledOnce();

      expect(f.value).toBe('b b');
      expect(fSpy).toHaveBeenCalledOnce();

      expect(g.value).toBe('b b');
      expect(gSpy).toHaveBeenCalledOnce();

      eSpy.mockClear();
      fSpy.mockClear();
      gSpy.mockClear();

      a.value = 'c';

      expect(e.value).toBe('c c');
      expect(eSpy).toHaveBeenCalledOnce();

      expect(f.value).toBe('c c');
      expect(fSpy).toHaveBeenCalledOnce();

      expect(g.value).toBe('c c');
      expect(gSpy).toHaveBeenCalledOnce();

      // top to bottom
      expect(eSpy).toHaveBeenCalledBefore(fSpy);
      // left to right
      expect(fSpy).toHaveBeenCalledBefore(gSpy);
    });

    it('should only subscribe to signals listened to', () => {
      //    *A
      //   /   \
      // *B     C <- we don't listen to C
      const a = signal('a');

      const b = computed(() => a.value);
      const spy = vi.fn(() => a.value);
      computed(spy);

      expect(b.value).toBe('a');
      expect(spy).not.toHaveBeenCalled();

      a.value = 'aa';
      expect(b.value).toBe('aa');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should stop updating a computed once nothing listens to it', () => {
      // Here both "B" and "C" are active in the beginning, but
      // "B" becomes inactive later. At that point it should
      // not receive any updates anymore.
      //    *A
      //   /   \
      // *B     D <- we don't listen to C
      //  |
      // *C
      const a = signal('a');
      const spyB = vi.fn(() => a.value);
      const b = computed(spyB);

      const spyC = vi.fn(() => b.value);
      const c = computed(spyC);

      const d = computed(() => a.value);

      let result = '';
      const unsub = effect(() => {
        result = c.value;
      });

      expect(result).toBe('a');
      expect(d.value).toBe('a');

      spyB.mockClear();
      spyC.mockClear();
      unsub();

      a.value = 'aa';

      expect(spyB).not.toHaveBeenCalled();
      expect(spyC).not.toHaveBeenCalled();
      expect(d.value).toBe('aa');
    });

    it('should ensure subs update even if one dep unmarks it', () => {
      // In this scenario "C" always returns the same value. When "A"
      // changes, "B" will update, then "C" at which point its update
      // to "D" will be unmarked. But "D" must still update because
      // "B" marked it. If "D" isn't updated, then we have a bug.
      //     A
      //   /   \
      //  B     *C <- returns same value every time
      //   \   /
      //     D
      const a = signal('a');
      const b = computed(() => a.value);
      const c = computed(() => {
        a.value;
        return 'c';
      });
      const spy = vi.fn(() => b.value + ' ' + c.value);
      const d = computed(spy);
      expect(d.value).toBe('a c');
      spy.mockClear();

      a.value = 'aa';
      d.value;
      expect(spy).toReturnWith('aa c');
    });

    it('should ensure subs update even if two deps unmark it', () => {
      // In this scenario both "C" and "D" always return the same
      // value. But "E" must still update because "A"  marked it.
      // If "E" isn't updated, then we have a bug.
      //     A
      //   / | \
      //  B *C *D
      //   \ | /
      //     E
      const a = signal('a');
      const b = computed(() => a.value);
      const c = computed(() => {
        a.value;
        return 'c';
      });
      const d = computed(() => {
        a.value;
        return 'd';
      });
      const spy = vi.fn(() => b.value + ' ' + c.value + ' ' + d.value);
      const e = computed(spy);
      expect(e.value).toBe('a c d');
      spy.mockClear();

      a.value = 'aa';
      e.value;
      expect(spy).toReturnWith('aa c d');
    });
  });

  describe('error handling', () => {
    it('should throw when writing to computeds', () => {
      const a = signal('a');
      const b = computed(() => a.value);
      const fn = () => ((b as Signal<unknown>).value = 'aa');
      expect(fn).toThrow(/Cannot set property value/);
    });

    it('should keep graph consistent on errors during activation', () => {
      const a = signal(0);
      const b = computed(() => {
        throw new Error('fail');
      });
      const c = computed(() => a.value);
      expect(() => b.value).toThrow('fail');

      a.value = 1;
      expect(c.value).toBe(1);
    });

    it('should keep graph consistent on errors in computeds', () => {
      const a = signal(0);
      const b = computed(() => {
        if (a.value === 1) throw new Error('fail');
        return a.value;
      });
      const c = computed(() => b.value);
      expect(c.value).toBe(0);

      a.value = 1;
      expect(() => b.value).toThrow('fail');

      a.value = 2;
      expect(c.value).toBe(2);
    });

    it('should support lazy branches', () => {
      const a = signal(0);
      const b = computed(() => a.value);
      const c = computed(() => (a.value > 0 ? a.value : b.value));

      expect(c.value).toBe(0);
      a.value = 1;
      expect(c.value).toBe(1);

      a.value = 0;
      expect(c.value).toBe(0);
    });

    it('should not update a sub if all deps unmark it', () => {
      // In this scenario "B" and "C" always return the same value. When "A"
      // changes, "D" should not update.
      //     A
      //   /   \
      // *B     *C
      //   \   /
      //     D
      const a = signal('a');
      const b = computed(() => {
        a.value;
        return 'b';
      });
      const c = computed(() => {
        a.value;
        return 'c';
      });
      const spy = vi.fn(() => b.value + ' ' + c.value);
      const d = computed(spy);
      expect(d.value).toBe('b c');
      spy.mockClear();

      a.value = 'aa';
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

describe('batch/transaction', () => {
  it('should not rerun an effect for a no-op batch assignment', () => {
    const foo = signal(42);
    const spy = vi.fn(() => {
      foo.value;
    });

    effect(spy);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    batch(() => {
      foo.value = 0;
      foo.value = 42;
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not rerun an effect for repeated no-op top-level batches', () => {
    const foo = signal(42);
    const spy = vi.fn(() => {
      foo.value;
    });

    effect(spy);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    batch(() => {
      foo.value = 0;
      foo.value = 42;
    });
    expect(spy).not.toHaveBeenCalled();

    batch(() => {
      foo.value = -1;
      foo.value = 42;
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not rerun an effect subscribed through a computed for a no-op batch assignment', () => {
    const foo = signal(42);
    const double = computed(() => foo.value * 2);
    const spy = vi.fn(() => {
      double.value;
    });

    effect(spy);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockClear();

    batch(() => {
      foo.value = 0;
      foo.value = 42;
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should keep unsubscribed computeds coherent when they are read during a reverted batch', () => {
    const foo = signal('A');
    const double = computed(() => foo.value + '!');
    expect(double.value).toBe('A!');

    batch(() => {
      foo.value = 'B';
      expect(double.value).toBe('B!');
      foo.value = 'A';
    });

    foo.value = 'C';
    expect(double.value).toBe('C!');
  });

  it('should keep unsubscribed computeds coherent when they are peeked during a reverted batch', () => {
    const foo = signal(1);
    const double = computed(() => foo.value * 2);
    expect(double.peek()).toBe(2);

    batch(() => {
      foo.value = 2;
      expect(double.peek()).toBe(4);
      foo.value = 1;
    });

    foo.value = 3;
    expect(double.peek()).toBe(6);
  });

  it('should not rerun an effect for a value a nested batch puts back by its own `equals`', () => {
    const standings = signal(
      { leader: 'Ada', lap: 3 },
      { equals: (previous, next) => previous.leader === next.leader }
    );
    const spy = vi.fn(() => {
      standings.value;
    });

    effect(spy);
    spy.mockClear();
    batch(() => {
      standings.value = { leader: 'Grace', lap: 4 };
      batch(() => {
        standings.value = { leader: 'Ada', lap: 5 };
      });
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should rerun an effect after a batch that threw once it put a value back, for the next change', () => {
    const foo = signal(1);
    const spy = vi.fn(() => {
      foo.value;
    });

    effect(spy);
    spy.mockClear();
    expect(() =>
      batch(() => {
        foo.value = 2;
        throw new Error('stopped');
      })
    ).toThrow('stopped');
    batch(() => {
      foo.value = 3;
      foo.value = 2;
    });

    expect(spy).toHaveBeenCalledOnce();
  });

  it('should return the value from the callback', () => {
    expect(batch(() => 1)).toBe(1);
  });

  it('should throw errors thrown from the callback', () => {
    expect(() =>
      batch(() => {
        throw Error('hello');
      })
    ).toThrow('hello');
  });

  it('should throw non-errors thrown from the callback', () => {
    try {
      batch(() => {
        throw undefined;
      });
      expect.fail();
    } catch (err) {
      expect(err).to.be.undefined;
    }
  });

  it('should delay writes', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      return a.value + ' ' + b.value;
    });
    effect(spy);
    spy.mockClear();

    batch(() => {
      a.value = 'aa';
      b.value = 'bb';
    });
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should delay writes until outermost batch is complete', () => {
    const a = signal('a');
    const b = signal('b');
    const spy = vi.fn(() => {
      a.value + ', ' + b.value;
    });
    effect(spy);
    spy.mockClear();

    batch(() => {
      batch(() => {
        a.value += ' inner';
        b.value += ' inner';
      });
      a.value += ' outer';
      b.value += ' outer';
    });

    // If the inner batch() would have flushed the update
    // this spy would've been called twice.
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should read signals written to', () => {
    const a = signal('a');

    let result = '';
    batch(() => {
      a.value = 'aa';
      result = a.value;
    });

    expect(result).toBe('aa');
  });

  it('should read computed signals with updated source signals', () => {
    // A->B->C->D->E
    const a = signal('a');
    const b = computed(() => a.value);

    const spyC = vi.fn(() => b.value);
    const c = computed(spyC);

    const spyD = vi.fn(() => c.value);
    const d = computed(spyD);

    const spyE = vi.fn(() => d.value);
    const e = computed(spyE);

    spyC.mockClear();
    spyD.mockClear();
    spyE.mockClear();

    let result = '';
    batch(() => {
      a.value = 'aa';
      result = c.value;

      // Since "D" isn't accessed during batching, we should not
      // update it, only after batching has completed
      expect(spyD).not.toHaveBeenCalled();
    });

    expect(result).toBe('aa');
    expect(d.value).toBe('aa');
    expect(e.value).toBe('aa');
    expect(spyC).toHaveBeenCalledOnce();
    expect(spyD).toHaveBeenCalledOnce();
    expect(spyE).toHaveBeenCalledOnce();
  });

  it('should not block writes after batching completed', () => {
    // If no further writes after batch() are possible, than we
    // didn't restore state properly. Most likely "pending" still
    // holds elements that are already processed.
    const a = signal('a');
    const b = signal('b');
    const c = signal('c');
    const d = computed(() => a.value + ' ' + b.value + ' ' + c.value);

    let result;
    effect(() => {
      result = d.value;
    });

    batch(() => {
      a.value = 'aa';
      b.value = 'bb';
    });
    c.value = 'cc';
    expect(result).toBe('aa bb cc');
  });

  it('should not lead to stale signals with .value in batch', () => {
    const invokes: number[][] = [];
    const counter = signal(0);
    const double = computed(() => counter.value * 2);
    const triple = computed(() => counter.value * 3);

    effect(() => {
      invokes.push([double.value, triple.value]);
    });

    expect(invokes).to.deep.equal([[0, 0]]);

    batch(() => {
      counter.value = 1;
      expect(double.value).toBe(2);
    });
    expect(invokes[1]).to.deep.equal([2, 3]);
  });
  it('should not lead to stale signals with peek() in batch', () => {
    const invokes: number[][] = [];
    const counter = signal(0);
    const double = computed(() => counter.value * 2);
    const triple = computed(() => counter.value * 3);

    effect(() => {
      invokes.push([double.value, triple.value]);
    });

    expect(invokes).to.deep.equal([[0, 0]]);

    batch(() => {
      counter.value = 1;
      expect(double.peek()).toBe(2);
    });

    expect(invokes[1]).to.deep.equal([2, 3]);
  });

  it('should run pending effects even if the callback throws', () => {
    const a = signal(0);
    const b = signal(1);
    const spy1 = vi.fn(() => {
      a.value;
    });
    const spy2 = vi.fn(() => {
      b.value;
    });
    effect(spy1);
    effect(spy2);
    spy1.mockClear();
    spy2.mockClear();

    expect(() =>
      batch(() => {
        a.value++;
        b.value++;
        throw Error('hello');
      })
    ).toThrow('hello');

    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
  });

  it('should run pending effects even if some effects throw', () => {
    const a = signal(0);
    const spy1 = vi.fn(() => {
      a.value;
    });
    const spy2 = vi.fn(() => {
      a.value;
    });
    effect(() => {
      if (a.value === 1) {
        throw new Error('hello');
      }
    });
    effect(spy1);
    effect(() => {
      if (a.value === 1) {
        throw new Error('hello');
      }
    });
    effect(spy2);
    effect(() => {
      if (a.value === 1) {
        throw new Error('hello');
      }
    });
    spy1.mockClear();
    spy2.mockClear();

    expect(() =>
      batch(() => {
        a.value++;
      })
    ).toThrow('hello');

    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
  });
  it("should run effect's first run immediately even inside a batch", () => {
    let callCount = 0;
    const spy = vi.fn();
    batch(() => {
      effect(spy);
      callCount = spy.mock.calls.length;
    });
    expect(callCount).toBe(1);
  });
});
describe('untracked', () => {
  it('should block tracking inside effects', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn(() => {
      a.value + b.value;
    });
    effect(() => untracked(spy));
    expect(spy).toHaveBeenCalledOnce();

    a.value = 10;
    b.value = 20;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should block tracking even when run inside effect run inside untracked', () => {
    const s = signal(1);
    const spy = vi.fn(() => s.value);

    untracked(() =>
      effect(() => {
        untracked(spy);
      })
    );
    expect(spy).toHaveBeenCalledOnce();

    s.value = 2;
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should not cause signal assignments throw', () => {
    const a = signal(1);
    const aChangedTime = signal(0);

    const dispose = effect(() => {
      a.value;
      untracked(() => {
        aChangedTime.value = aChangedTime.value + 1;
      });
    });

    expect(() => (a.value = 2)).not.toThrow();
    expect(aChangedTime.value).toBe(2);
    a.value = 3;
    expect(aChangedTime.value).toBe(3);

    dispose();
  });

  it('should block tracking inside computed signals', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn(() => a.value + b.value);
    const c = computed(() => untracked(spy));

    expect(spy).not.toHaveBeenCalled();
    expect(c.value).toBe(3);
    a.value = 10;
    c.value;
    b.value = 20;
    c.value;
    expect(spy).toHaveBeenCalledOnce();
    expect(c.value).toBe(3);
  });
});

describe('reentrancy and errors', () => {
  it('should keep other effects subscribed when one of them throws', () => {
    const s = signal(1);
    const seen: number[] = [];
    effect(() => {
      if (s.value === 2) {
        throw new Error('boom');
      }
    });
    effect(() => {
      seen.push(s.value);
    });

    expect(() => (s.value = 2)).toThrow('boom');
    s.value = 3;

    expect(seen).toEqual([1, 2, 3]);
  });

  it('should keep tracking an effect after a nested subscription', () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn(() => {
      subscribe(
        computed(() => a.value),
        () => undefined
      );
      b.value;
    });
    effect(spy);
    spy.mockClear();

    b.value = 1;
    expect(spy).toHaveBeenCalledOnce();

    spy.mockClear();
    a.value = 1;
    expect(spy).not.toHaveBeenCalled();
  });

  it('should accept `undefined` as a new value', () => {
    const s = signal<string | undefined>('x');
    const spy = vi.fn();
    subscribe(s, spy);

    s.value = undefined;

    expect(s.value).toBeUndefined();
    expect(spy).toHaveBeenLastCalledWith(undefined);
  });
});
