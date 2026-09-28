import type { Nullable } from '@reely/utils';

/** What a rendered view must release when it goes away: subscriptions, effects and nested owners. */
export interface Owner {
  readonly cleanups: Set<VoidFunction>;
}

let currentOwner: Nullable<Owner> = null;

/**
 * The owner of the render that is running now, to pass to `withOwner` from code that renders
 * later, such as a list that adds a row when its signal changes.
 *
 * @returns {Nullable<Owner>} The current owner, if any.
 */
export const getOwner = (): Nullable<Owner> => currentOwner;

/**
 * Registers a release in the owner of the running render; outside any owner nothing holds it,
 * and the subscription lives as long as its signals.
 *
 * @param {VoidFunction} cleanup - Releases a subscription or an effect.
 * @returns {void}
 */
export const onCleanup = (cleanup: VoidFunction): void => {
  currentOwner?.cleanups.add(cleanup);
};

/**
 * Runs `fn` under a new owner nested in `parent`, and passes it the function that releases what
 * was registered meanwhile, nested owners included. Disposing the parent disposes this owner too.
 *
 * @template T - The result of `fn`.
 * @param {(dispose: VoidFunction) => T} fn - Renders under the new owner.
 * @param {Nullable<Owner>} [parent] - The owner to nest in; the current one by default.
 * @returns {T} The result of `fn`.
 */
export const withOwner = <T>(fn: (dispose: VoidFunction) => T, parent: Nullable<Owner> = currentOwner): T => {
  const owner: Owner = { cleanups: new Set() };
  const dispose = (): void => {
    parent?.cleanups.delete(dispose);
    // release in reverse order of creation, like a stack of resources
    const cleanups = [...owner.cleanups].reverse();
    owner.cleanups.clear();
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
  parent?.cleanups.add(dispose);

  const previous = currentOwner;
  currentOwner = owner;
  try {
    return fn(dispose);
  } finally {
    currentOwner = previous;
  }
};
