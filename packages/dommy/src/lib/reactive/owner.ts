import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

/** What a rendered view must release when it goes away: subscriptions, effects and nested owners. */
export interface Owner {
  readonly cleanups: Set<VoidFunction>;
}

let currentOwner: Nullable<Owner> = null;

/** For code that renders later, such as a list adding a row, to pass to `withOwner`. */
export const getOwner = (): Nullable<Owner> => currentOwner;

/** Registers a release in the owner of the running render; outside any owner nothing holds it. */
export const onCleanup = (cleanup: VoidFunction): void => {
  currentOwner?.cleanups.add(cleanup);
};

/**
 * Runs `fn` under a new owner nested in `parent` and passes it `dispose`. Every cleanup runs even
 * when one throws; the first error is rethrown after all have run.
 */
export const withOwner = <T>(fn: (dispose: VoidFunction) => T, parent: Nullable<Owner> = currentOwner): T => {
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
    // a render that failed leaves nothing subscribed
    currentOwner = previous;
    dispose();
    throw error;
  } finally {
    currentOwner = previous;
  }
};
