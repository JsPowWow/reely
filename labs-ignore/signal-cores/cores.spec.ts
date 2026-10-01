// The contract the three cores still share, through the public API alone: the shipped one from
// @reely/signals, the other two as the lab left them.
import * as act from './act/preact-like/preact-like.signal';
import * as restructured from './restructured/preact-like/preact-like.signal';
import * as shipped from '../../packages/signals/src/lib/signal';

type Core = Pick<typeof shipped, 'signal' | 'computed' | 'effect' | 'batch' | 'untracked'>;

const cores: [string, Core][] = [
  ['act', act],
  ['restructured', restructured],
  ['@reely/signals', shipped],
];

describe.each(cores)('the %s core', (_name, { signal, computed, effect, batch, untracked }) => {
  it('shows an effect on a diamond one current pair per write, never a stale one', () => {
    const count = signal(1);
    const double = computed(() => count.value * 2);
    const seen: string[] = [];
    effect(() => void seen.push(`${count.value} / ${double.value}`));

    count.value = 2;
    count.value = 3;

    expect(seen).toEqual(['1 / 2', '2 / 4', '3 / 6']);
  });

  it('runs an effect once for the writes of a batch', () => {
    const quantity = signal(1);
    const discount = signal(0);
    let runs = 0;
    effect(() => {
      void (quantity.value * (1 - discount.value));
      runs += 1;
    });

    batch(() => {
      quantity.value = 10;
      discount.value = 0.1;
    });

    expect(runs).toBe(2);
  });

  it('skips a write of an equal value, and an untracked read', () => {
    const shown = signal('a');
    const hidden = signal(0);
    let runs = 0;
    effect(() => {
      void shown.value;
      void untracked(() => hidden.value);
      runs += 1;
    });

    shown.value = 'a';
    hidden.value = 1;

    expect(runs).toBe(1);
  });

  it('stops an effect once it is disposed', () => {
    const count = signal(0);
    const seen: number[] = [];
    const dispose = effect(() => void seen.push(count.value));

    dispose();
    count.value = 1;

    expect(seen).toEqual([0]);
  });
});
