import {
  batch,
  computed,
  effect,
  onCleanup,
  signal,
  untracked,
} from '@reely/dommy';

const unread = signal(0);
const sender = signal('');
const title = computed(() =>
  unread.value === 0 ? 'Inbox' : `(${unread.value}) ${sender.value} wrote`
);

// Runs now, and again after every change of what it read.
const stop = effect(() => {
  const timer = setTimeout(() => (document.title = title.value), 1_000);
  onCleanup(() => clearTimeout(timer)); // before the next run, and on stop()
});

// a message arrives
batch(() => {
  unread.value += 1; // the effect runs once, when the batch ends
  sender.value = 'Maria';
});

untracked(() => unread.value); // reads without subscribing, like unread.peek()
stop();
