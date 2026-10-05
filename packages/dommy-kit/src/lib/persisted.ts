import { effect, signal } from '@reely/signals';
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
}

/** A nullable value has no kind to check what was read back against, so it needs `is`. */
type PersistedOptionsArg<T> = [T] extends [NonNullable<T>]
  ? [options?: PersistedOptions<T>]
  : [options: PersistedOptions<T> & Required<Pick<PersistedOptions<T>, 'is'>>];

/**
 * A signal stored as JSON under `key`, following writes from other tabs; it writes only when it
 * changes. When the storage is missing or throws (a private window, a full quota), it keeps
 * working in memory.
 */
export const persisted = <T>(key: string, initial: T, ...[options = {}]: PersistedOptionsArg<T>): Signal<T> => {
  const is = options.is ?? ((stored: unknown): stored is T => objectTypeOf(stored) === objectTypeOf(initial));
  const parse = (text: string | null): T =>
    Either.tryCatch((): T => {
      const stored: unknown = text === null ? initial : JSON.parse(text);
      return is(stored) ? stored : initial;
    }).getOrElse(initial);
  const storage = (): Pick<Storage, 'getItem' | 'setItem'> => options.storage ?? localStorage;

  // true while the value is set from what the storage holds, which needs no write back
  let reading = true;
  const value = signal(parse(Either.tryCatch(() => storage().getItem(key)).getOrElse(null)));
  effect(() => {
    const next = value.value;
    if (!reading) {
      Either.tryCatch(() => storage().setItem(key, JSON.stringify(next)));
    }
  });
  reading = false;

  listen(window, 'storage', (event) => {
    const ours = Either.tryCatch(() => event.storageArea === storage()).getOrElse(false);
    if (!ours || (event.key !== key && event.key !== null)) {
      return;
    }
    reading = true;
    try {
      // a `null` key is a `clear()`
      value.value = event.key === null ? initial : parse(event.newValue);
    } finally {
      reading = false;
    }
  });
  return value;
};
