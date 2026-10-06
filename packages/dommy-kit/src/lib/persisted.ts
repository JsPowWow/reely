import { reportUncaught } from '@reely/basics';
import { effect, signal, untracked } from '@reely/signals';
import type { Signal } from '@reely/signals';
import { Either, objectTypeOf } from '@reely/utils';

import { listen } from './listen';

export interface PersistedOptions<T> {
  /**
   * `localStorage` by default. Writes from other tabs are followed only for a real storage area
   * (`localStorage`, `sessionStorage`); another object receives none.
   */
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Checks what was read back; by default it must be of the kind of `initial`. */
  is?: (stored: unknown) => stored is T;
  /** Hears the error of a write the storage refused (a full quota, a blocked storage). */
  onSaveError?: (error: unknown) => void;
}

/**
 * A signal stored as JSON under `key`, following writes from other tabs; it writes only when it
 * changes. When the storage is missing or throws (a private window, a full quota), it keeps
 * working in memory.
 */
export function persisted<T extends NonNullable<unknown>>(
  key: string,
  initial: T,
  options?: PersistedOptions<T>
): Signal<T>;
/**
 * A signal stored as JSON under `key`, as above. A nullable value has no kind to check what was read
 * back against, so it names `is`; a wrapper that passes its own optional `is` on answers for that.
 */
export function persisted<T>(
  key: string,
  initial: T,
  options: PersistedOptions<T> & { is: PersistedOptions<T>['is'] }
): Signal<T>;
export function persisted<T>(key: string, initial: T, options: PersistedOptions<T> = {}): Signal<T> {
  const is = options.is ?? ((stored: unknown): stored is T => objectTypeOf(stored) === objectTypeOf(initial));
  const parse = (text: string | null): T =>
    Either.tryCatch((): T => {
      const stored: unknown = text === null ? initial : JSON.parse(text);
      return is(stored) ? stored : initial;
    }).getOrElse(initial);
  const storage = (): Pick<Storage, 'getItem' | 'setItem'> => options.storage ?? localStorage;
  // the app's handler runs as code outside the effect: untracked, and its throw is no write's
  const hearSaveError = (error: unknown): void => {
    Either.tryCatch(() => untracked(() => options.onSaveError?.(error))).mapLeft(reportUncaught);
  };

  const value = signal(parse(Either.tryCatch(() => storage().getItem(key)).getOrElse(null)));
  // the value as the storage holds it, as far as this tab knows: only a different one is written
  let known = JSON.stringify(value.peek());
  effect(() => {
    const text = JSON.stringify(value.value);
    if (text !== known) {
      known = text;
      // the error as thrown, not wrapped: a storage of another realm (a frame's) throws no `Error` of
      // this one, and its `name` tells a full quota from a blocked storage
      try {
        storage().setItem(key, text);
      } catch (error) {
        hearSaveError(error);
      }
    }
  });

  listen(window, 'storage', (event) => {
    const ours = Either.tryCatch(() => event.storageArea === storage()).getOrElse(false);
    if (!ours || (event.key !== key && event.key !== null)) {
      return;
    }
    // a `null` key is a `clear()`
    const next = event.key === null ? initial : parse(event.newValue);
    known = JSON.stringify(next);
    value.value = next;
  });
  return value;
}
