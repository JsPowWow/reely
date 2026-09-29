import { Either, objectTypeOf } from '@reely/utils';

import { listen } from './kit.listen';
import { effect, signal } from '../reactive/preact-like/preact-like.signal';

import type { Signal } from '../reactive/preact-like/preact-like.signal';

export interface PersistedOptions<T> {
  /** `localStorage` by default. */
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Checks what was read back; by default it must be of the kind of `initial`. */
  is?: (stored: unknown) => stored is T;
}

/**
 * A signal stored as JSON under `key`, following writes from other tabs. When the storage is
 * missing or throws (a private window, a full quota), it keeps working in memory.
 */
export const persisted = <T>(key: string, initial: T, options: PersistedOptions<T> = {}): Signal<T> => {
  const is = options.is ?? ((stored: unknown): stored is T => objectTypeOf(stored) === objectTypeOf(initial));
  const parse = (text: string | null): T =>
    Either.tryCatch((): unknown => (text === null ? initial : JSON.parse(text)))
      .map((stored) => (is(stored) ? stored : initial))
      .getOrElse(initial);
  const storage = (): Pick<Storage, 'getItem' | 'setItem'> => options.storage ?? localStorage;

  const value = signal(parse(Either.tryCatch(() => storage().getItem(key)).getOrElse(null)));
  effect(() => {
    const text = JSON.stringify(value.value);
    Either.tryCatch(() => storage().setItem(key, text));
  });
  listen(window, 'storage', (event) => {
    if (event.key === key) {
      value.value = parse(event.newValue);
    }
  });
  return value;
};
