import { Either } from '@reely/utils';

import { listen } from './kit.listen';
import { effect, signal } from '../reactive/preact-like/preact-like.signal';

import type { Signal } from '../reactive/preact-like/preact-like.signal';

/** @template T - The value type. */
export interface PersistedOptions<T> {
  /** Where the value lives; `localStorage` by default, `sessionStorage` or a stand-in in tests. */
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Checks what was read back; by default it must be of the kind of the initial value. */
  is?: (stored: unknown) => stored is T;
}

const kindOf = (value: unknown): string => Object.prototype.toString.call(value);

/**
 * A signal kept in storage under `key`: it starts from the stored value and stores every write
 * as JSON. A value written by another tab to `localStorage` comes in too, until the render that
 * created it is disposed. When the storage is missing or throws (a private window, a full
 * quota), the signal keeps working in memory.
 *
 * @template T - The value type, one that survives JSON.
 * @param {string} key - The storage key.
 * @param {T} initial - The value when nothing usable is stored.
 * @param {PersistedOptions<T>} [options] - The storage and the check of what is read back.
 * @returns {Signal<T>} The signal.
 */
export const persisted = <T>(key: string, initial: T, options: PersistedOptions<T> = {}): Signal<T> => {
  const is = options.is ?? ((stored: unknown): stored is T => kindOf(stored) === kindOf(initial));
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
