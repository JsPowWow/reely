import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { onCleanup } from '../reactive/owner';
import { computed, effect, signal, untracked } from '../reactive/preact-like/preact-like.signal';

import type { Computed } from '../reactive/preact-like/preact-like.signal';
import type { ReactiveValue } from '../types/dommy.types';

/**
 * Follows `source` at most once per `ms`: the first change passes at once, the latest one within
 * the interval passes when it ends.
 */
export const throttled = <T>(source: ReactiveValue<T>, ms: number): Computed<T> => {
  const output = signal(untracked(source));
  let latest = output.peek();
  let pending = false;
  let timer: Nullable<ReturnType<typeof setTimeout>> = null;
  let started = false;

  const endInterval = (): void => {
    timer = null;
    if (pending) {
      pending = false;
      output.value = latest;
      timer = setTimeout(endInterval, ms);
    }
  };

  effect(() => {
    latest = source();
    if (!started) {
      started = true;
    } else if (hasSome(timer)) {
      pending = true;
    } else {
      output.value = latest;
      timer = setTimeout(endInterval, ms);
    }
  });
  onCleanup(() => {
    if (hasSome(timer)) {
      clearTimeout(timer);
    }
  });
  return computed(() => output.value);
};
