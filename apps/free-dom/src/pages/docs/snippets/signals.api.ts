import { batch, computed, effect, onCleanup, signal, untracked } from '@reely/dommy';

const lap = signal(1);
const leader = signal('Car 3');
const title = computed(() => `Lap ${lap.value}: ${leader.value} leads`);

// Runs now, and again after every change of what it read.
const stop = effect(() => {
  const timer = setTimeout(() => (document.title = title.value), 1_000);
  onCleanup(() => clearTimeout(timer)); // before the next run, and on stop()
});

batch(() => {
  lap.value += 1; // the effect runs once, when the batch ends
  leader.value = 'Car 7';
});

untracked(() => lap.value); // reads without subscribing, like lap.peek()
stop();
