import { onCleanup, signal } from '@reely/dommy';
import type { Signal } from '@reely/dommy';
import { later } from '@reely/dommy-kit';
import { getOwner, withOwner } from '@reely/signals';
import type { ReadableStore } from '@reely/simple-store';

/**
 * A signal that follows a store while the view that made it lives: stores hold
 * the game, signals draw it.
 */
export const following = <T>(store: ReadableStore<T>): Signal<Readonly<T>> => {
  const value = signal(store.value);
  onCleanup(store.on('changed', (next) => value.set(next)));
  return value;
};

/**
 * `later` for code that runs after the render, a click or a transition: each
 * timer belongs to the view that made this, so disposing the view stops it; the
 * cancel it returns stops it sooner.
 */
export const ownedLater = (): ((
  ms: number,
  fn: VoidFunction
) => VoidFunction) => {
  const owner = getOwner();
  return (ms, fn) =>
    withOwner((dispose) => {
      later(ms, () => {
        dispose();
        fn();
      });
      return dispose;
    }, owner);
};
