import { computed as dommyComputed, effect as dommyEffect, signal as dommySignal } from '@reely/dommy';

import { computed, effect, signal } from './signals';

// A diamond: an effect reads a signal and a computed of it. The graph here notifies consumers
// in subscription order and runs an effect at once, so the effect runs before the computed is
// marked dirty, sees a stale value, and re-runs itself without end.
describe('A diamond: an effect reads `count` and `double = count * 2`', () => {
  it('shows the effect a stale computed, then runs it until something stops it', () => {
    const count = signal(1);
    const double = computed(() => count() * 2);
    const seen: string[] = [];
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    effect(() => {
      if (seen.length === 10) {
        throw new Error('stopped by the spec');
      }
      seen.push(`${count()}/${double()}`);
    });

    count.set(2);
    error.mockRestore();

    expect(seen.slice(0, 3)).toEqual(['1/2', '2/2', '2/4']);
    expect(seen).toHaveLength(10);
  });

  it('runs the dommy effect once per change, with a current computed', () => {
    const count = dommySignal(1);
    const double = dommyComputed(() => count.value * 2);
    const seen: string[] = [];
    dommyEffect(() => {
      seen.push(`${count.value}/${double.value}`);
    });

    count.value = 2;

    expect(seen).toEqual(['1/2', '2/4']);
  });
});
