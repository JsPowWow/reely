// Times the same five graphs on each core, rounds interleaved, and prints the median of each.
import * as act from './act/preact-like/preact-like.signal';
import * as restructured from './restructured/preact-like/preact-like.signal';
import * as shipped from '../../packages/signals/src/lib/signal';

type Core = Pick<typeof shipped, 'signal' | 'computed' | 'effect' | 'batch'>;

const cores: Record<string, Core> = { act, restructured, shipped };

const scenarios: Record<string, (core: Core) => void> = {
  // a scoreboard: many signals, each bound once, written one at a time
  'wide: 1000 signals, 10k writes': ({ signal, effect }) => {
    const cells = Array.from({ length: 1000 }, (_, i) => signal(i));
    let sink = 0;
    const stops = cells.map((cell) => effect(() => void (sink += cell.value)));
    for (let i = 0; i < 10_000; i++) cells[i % 1000].value += 1;
    stops.forEach((stop) => stop());
  },
  'deep: 200 computeds in a chain, 2k writes': ({ signal, computed, effect }) => {
    const head = signal(0);
    let last: { readonly value: number } = head;
    for (let i = 0; i < 200; i++) {
      const previous = last;
      last = computed(() => previous.value + 1);
    }
    let sink = 0;
    const stop = effect(() => void (sink += last.value));
    for (let i = 0; i < 2000; i++) head.value += 1;
    stop();
  },
  'diamond: 1 → 100 computeds → 1 effect, 5k writes': ({ signal, computed, effect }) => {
    const head = signal(0);
    const mids = Array.from({ length: 100 }, (_, i) => computed(() => head.value * i));
    let sink = 0;
    const stop = effect(() => {
      for (const mid of mids) sink += mid.value;
    });
    for (let i = 0; i < 5000; i++) head.value += 1;
    stop();
  },
  'batch: 100 writes per batch, 2k batches': ({ signal, computed, effect, batch }) => {
    const cells = Array.from({ length: 100 }, () => signal(0));
    const total = computed(() => cells.reduce((sum, cell) => sum + cell.value, 0));
    let sink = 0;
    const stop = effect(() => void (sink += total.value));
    for (let b = 0; b < 2000; b++) batch(() => cells.forEach((cell) => (cell.value += 1)));
    stop();
  },
  // views come and go
  'churn: create and dispose 20k effects': ({ signal, effect }) => {
    const s = signal(0);
    for (let i = 0; i < 20_000; i++) effect(() => void s.value)();
  },
};

const time = (run: () => void): number => {
  const start = performance.now();
  run();
  return performance.now() - start;
};

const median = (values: readonly number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const samples = new Map<string, number[]>();
for (const [name, scenario] of Object.entries(scenarios)) {
  for (const core of Object.values(cores)) {
    for (let i = 0; i < 3; i++) scenario(core); // warm up
  }
  for (let round = 0; round < 7; round++) {
    for (const [coreName, core] of Object.entries(cores)) {
      const key = `${name}|${coreName}`;
      samples.set(key, [...(samples.get(key) ?? []), time(() => scenario(core))]);
    }
  }
}

console.log(['scenario', ...Object.keys(cores)].join(' | '));
for (const name of Object.keys(scenarios)) {
  const cells = Object.keys(cores).map(
    (coreName) => `${median(samples.get(`${name}|${coreName}`) ?? []).toFixed(1)} ms`
  );
  console.log([name, ...cells].join(' | '));
}
