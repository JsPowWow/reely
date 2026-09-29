import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { onCleanup } from '../reactive/owner';
import { computed, effect, signal, untracked } from '../reactive/preact-like/preact-like.signal';

import type { Computed } from '../reactive/preact-like/preact-like.signal';
import type { ReactiveValue } from '../types/dommy.types';

/**
 * A computed that follows `source` at most once per `ms`: the first change passes at once,
 * later ones within the interval wait, and the latest of them passes when it ends. For a board
 * whose source changes every frame but whose rows should move a few times a second.
 *
 * @template T - The value type.
 * @param {ReactiveValue<T>} source - A signal or a getter.
 * @param {number} ms - The shortest time between two changes, in milliseconds.
 * @returns {Computed<T>} The throttled value.
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
