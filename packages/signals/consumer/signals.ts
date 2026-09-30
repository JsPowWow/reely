import { batch, computed, effect, onCleanup, signal, untracked, withOwner } from '@reely/signals';
import { subscriberCount } from '@reely/signals/testing';

import type { Computed, ReactiveValue, Signal, SignalOptions } from '@reely/signals';

const lap: Signal<number> = signal(1);
const leader = signal('Ada');
const title: Computed<string> = computed(() => `lap ${lap()}: ${leader.value}`);
const read: ReactiveValue<string> = title;

const shown: string[] = [];
const released: string[] = [];
const dispose = withOwner((dispose) => {
  effect(() => {
    shown.push(read());
  });
  onCleanup(() => released.push('board'));
  return dispose;
});

batch(() => {
  lap.set(2);
  leader.value = 'Grace';
});
lap.update((value) => value + untracked(() => 1));
dispose();
lap.set(9);

const garage = { cars: ['Volvo'] };
const always: SignalOptions<typeof garage> = { equals: () => false };
const state = signal(garage, always);
const counts: number[] = [];
effect(() => {
  counts.push(state.value.cars.length);
});
garage.cars.push('Saab');
state.value = garage;

if (
  counts.join() !== '1,2' ||
  shown.join('|') !== 'lap 1: Ada|lap 2: Grace|lap 3: Grace' ||
  released.join() !== 'board' ||
  subscriberCount(lap) !== 0
) {
  throw new Error(`unexpected signals: ${JSON.stringify({ shown, released, counts })}`);
}
