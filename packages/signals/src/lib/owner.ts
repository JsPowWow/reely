import { hasSome } from '@reely/basics';
import type { Nullable } from '@reely/utils';

/** What a piece of work must release when it ends: its effects, cleanups and nested owners. */
export interface Owner {
  readonly cleanups: Set<() => void>;
}

let currentOwner: Nullable<Owner> = null;

/** For code that runs later, such as a callback creating effects, to pass to `withOwner`. */
export const getOwner = (): Nullable<Owner> => currentOwner;

/** Registers a release in the running owner; outside any owner nothing holds it. */
export const onCleanup = (cleanup: () => void): void => {
  currentOwner?.cleanups.add(cleanup);
};

/**
 * Runs `fn` under a new owner nested in `parent` and passes it `dispose`. Every cleanup runs even
 * when one throws; the first error is rethrown after all have run.
 */
export const withOwner = <T>(fn: (dispose: () => void) => T, parent: Nullable<Owner> = currentOwner): T => {
  const owner: Owner = { cleanups: new Set() };
  const dispose = (): void => {
    parent?.cleanups.delete(dispose);
    // reverse order of creation, like a stack of resources
    const cleanups = [...owner.cleanups].reverse();
    owner.cleanups.clear();
    let failure: Nullable<{ readonly error: unknown }> = null;
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (error) {
        failure ??= { error };
      }
    }
    if (hasSome(failure)) {
      throw failure.error;
    }
  };
  parent?.cleanups.add(dispose);

  const previous = currentOwner;
  currentOwner = owner;
  try {
    return fn(dispose);
  } catch (error) {
    // work that failed leaves nothing subscribed
    currentOwner = previous;
    dispose();
    throw error;
  } finally {
    currentOwner = previous;
  }
};
