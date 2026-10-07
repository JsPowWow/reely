import { hasSome } from '@reely/basics';
import { onCleanup } from '@reely/signals';
import type { Nullable } from '@reely/utils';

/** A function that waits out its calls, with a way to drop the waiting call or make it now. */
export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** Drops the waiting call. */
  cancel(): void;
  /** Makes the waiting call now, if there is one. */
  flush(): void;
}

/**
 * Calls `fn` with the latest arguments once the calls stop for `ms`. A waiting call is dropped when
 * the render that made it is disposed.
 */
export const debounced = <A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> => {
  let waiting: Nullable<{ readonly args: A }> = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = (): void => {
    clearTimeout(timer);
    waiting = null;
  };
  const flush = (): void => {
    if (hasSome(waiting)) {
      const { args } = waiting;
      cancel();
      fn(...args);
    }
  };
  const call = (...args: A): void => {
    clearTimeout(timer);
    waiting = { args };
    timer = setTimeout(flush, ms);
  };

  onCleanup(cancel);
  return Object.assign(call, { cancel, flush });
};
