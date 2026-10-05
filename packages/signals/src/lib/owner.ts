import { hasSome } from '@reely/basics';
import type { Nullable } from '@reely/utils';
import { isNil } from '@reely/utils';

/**
 * What a piece of work must release when it ends: its effects, cleanups and nested owners. Opaque:
 * `getOwner` captures one for `withOwner`.
 */
export class Owner {
  // `null` once disposed: a disposed owner holds nothing, so what it is given later goes at once
  #cleanups: Nullable<Set<() => void>> = new Set();

  /** Holds `cleanup` until `owner` is disposed; a disposed owner runs it now, no owner holds nothing. */
  public static hold(owner: Nullable<Owner>, cleanup: () => void): void {
    if (isNil(owner)) {
      return;
    }
    if (isNil(owner.#cleanups)) {
      cleanup();
    } else {
      owner.#cleanups.add(cleanup);
    }
  }

  /** Forgets `cleanup`, released by itself before `owner` goes. */
  public static drop(owner: Nullable<Owner>, cleanup: () => void): void {
    if (hasSome(owner)) {
      owner.#cleanups?.delete(cleanup);
    }
  }

  /** Runs every cleanup, the last held first, even when one throws; the first error is rethrown. */
  public static dispose(owner: Owner): void {
    // reverse order of creation, like a stack of resources
    const cleanups = [...(owner.#cleanups ?? [])].reverse();
    owner.#cleanups = null;
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
  }
}

let currentOwner: Nullable<Owner> = null;

/** For code that runs later, such as a callback creating effects, to pass to `withOwner`. */
export const getOwner = (): Nullable<Owner> => currentOwner;

/** Registers a release in the running owner; outside any owner nothing holds it, and it never runs. */
export const onCleanup = (cleanup: () => void): void => {
  Owner.hold(currentOwner, cleanup);
};

/**
 * Runs `fn` under a new owner nested in `parent` and passes it `dispose`. Every cleanup runs even
 * when one throws; the first error is rethrown after all have run. Under a disposed `parent`, the
 * new owner is disposed at once, and so is everything `fn` registers with it.
 */
export const withOwner = <T>(fn: (dispose: () => void) => T, parent: Nullable<Owner> = currentOwner): T => {
  const owner = new Owner();
  const dispose = (): void => {
    Owner.drop(parent, dispose);
    Owner.dispose(owner);
  };
  Owner.hold(parent, dispose);

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
