import { onCleanup, signal } from '@reely/dommy';
import type { Signal } from '@reely/dommy';
import type { ReadableStore } from '@reely/simple-store';
import { Either } from '@reely/utils';

/**
 * A signal that follows a store while the view that made it lives: stores hold
 * the game, signals draw it.
 */
export const following = <T>(store: ReadableStore<T>): Signal<Readonly<T>> => {
  const value = signal(store.value);
  onCleanup(store.on('changed', (next) => value.set(next)));
  return value;
};

/** The browser's `localStorage`, or nothing where reading it throws. */
export const browserStorage = (): Storage | undefined =>
  Either.tryCatch((): Storage | undefined => localStorage).getOrElse(undefined);
