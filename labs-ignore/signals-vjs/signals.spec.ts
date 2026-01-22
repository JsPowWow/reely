import { state, derive } from './_internals';
import * as signals from './signals';
import { batch, computed, effect, signal, untracked, watch } from './signals';

import type { Signal } from './signals';

describe('Signals tests', () => {
  it('batch test', () => {
    const computedFn = vi.fn();
    const effectFn = vi.fn();
    const watchFn = vi.fn();
    const computedSpy = vi.spyOn(signals, 'computed');

    const count = signal(0);
    const double = computed(() => {
      computedFn();
      return count() * 2;
    });

    effect(() => {
      effectFn(count(), double());
    });

    watch(
      () => [count(), double()],
      ([c, d], [cOld, dOld]) => {
        watchFn([c, d, cOld, dOld]);
      }
    );

    expect([count(), double()]).toStrictEqual([0, 0]);

    batch(() => {
      count.set(1);

      batch(() => {
        count.set(2);
        count.set(3);
      });

      count.set(4);
      count.set(5);
    });

    expect([count(), double()]).toStrictEqual([5, 10]);

    expect(computedSpy).toHaveBeenCalledTimes(1);
    expect(computedFn).toHaveBeenCalledTimes(2);

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenNthCalledWith(1, 0, 0);
    expect(effectFn).toHaveBeenNthCalledWith(2, 5, 10);

    expect(watchFn).toHaveBeenCalledTimes(1);
    expect(watchFn).toHaveBeenCalledWith([5, 10, 0, 0]);
  });

  it('mutate tests', () => {
    const tasks = signal<{ title: string }[]>([{ title: 'Init' }]);
    const effectFn = vi.fn();
    effect(() => {
      effectFn(JSON.stringify(tasks()));
    });

    tasks.mutate((list) => {
      list[0].title = 'Changed';
      list.push({ title: 'New' });
    });

    expect(tasks()).toStrictEqual([{ title: 'Changed' }, { title: 'New' }]);
  });

  it('batch & mutate + effect() tests', () => {
    const user = state<{ id: number; name: string }>({ id: 1, name: 'Alice' });
    const multiplier = state(2);
    const userName = derive(() => user.val.name.toUpperCase());

    const effectFn = vi.fn(() => {
      console.log('EFFECT', userName.val, multiplier.val);
    });

    const e = derive(effectFn);

    // user.val = ((u) => (u.name = 'Bob'));
    user.val = { id: 22, name: 'Bob' };
    multiplier.val = 10;

    console.log('RESULT', e.val, userName.val, multiplier.val);
    //
    // expect(effectFn).toHaveBeenCalledTimes(2);
    // expect(userName()).toBe('BOB');
    // expect(multiplier()).toBe(10);
  });

  it('batch & mutate + effect( with untracked) tests', () => {
    const user = signal<{ id: number; name: string }>({ id: 1, name: 'Alice' });
    const multiplier = signal(2);
    const userName = computed(() => user().name.toUpperCase());
    const effectFn = vi.fn(() => {
      const name = userName();

      // Мы читаем multiplier, но НЕ подписываемся на него
      // Эффект сработает при смене имени, но не при смене multiplier
      const untrackedMultiplier = untracked(() => multiplier());

      console.log(`User: ${name}, Multiplier is currently: ${untrackedMultiplier}`);
      // expect(name).toBe('ALICE');
      // expect(untrackedMultiplier).toBe(2);
    });

    effect(effectFn);

    batch(() => {
      user.mutate((u) => (u.name = 'Bob'));
      multiplier.set(10);
    });
    // Эффект сработает только 1 раз в конце
    // Вывод: User: BOB, Multiplier is currently: 10
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(userName()).toBe('BOB');
    expect(multiplier()).toBe(10);
  });
});

describe('Signals cycle safety tests', () => {
  it('tests A->B', () => {
    const valA: Signal<unknown> = computed(() => valB());
    const valB: Signal<unknown> = computed(() => valA());

    expect(() => valA()).toThrowError();
    expect(() => valB()).not.toThrowError();
  });

  it('cycle safety tests B->A', () => {
    const valA: Signal<unknown> = computed(() => valB());
    const valB: Signal<unknown> = computed(() => valA());

    expect(() => valB()).toThrowError();
    expect(() => valA()).not.toThrowError();
  });

  it('cycle safety tests A->B->C', () => {
    const valA: Signal<unknown> = computed(() => valB());
    const valB: Signal<unknown> = computed(() => valC());
    const valC: Signal<unknown> = computed(() => valA());

    expect(() => valB()).toThrowError();
    expect(() => valA()).not.toThrowError();
    expect(() => valC()).not.toThrowError();
  });
});

describe('Signals cleanup tests', () => {
  it('effect onCleanup test', () => {
    const id = signal(1);
    expect.assertions(6);
    const expectedIds = [1, 20, 30];
    effect((onCleanup) => {
      const currentId = id();

      onCleanup(() => {
        expect(currentId).toBe(expectedIds.shift());
      });
    });

    id.set(20);
    expect(id()).toBe(20);

    id.set(30);
    expect(id()).toBe(30);

    id.set(70);
    expect(id()).toBe(70);
  });
});
