import { isPlainObject, isSomeFunction } from '@reely/utils';

import { Store } from './store';

/**
 * An object that changes a few fields at a time and says so. Each `set` makes a new object, so a
 * value read earlier stays as it was, and notifies the `changed` listeners with it; a `set` made
 * by a listener reaches the listeners once they all have the current object.
 *
 * @template T - A plain object (`{ … }`): `set` copies its own fields into a new one, so a class
 *   instance would lose its methods.
 */
export class ObjectStore<T extends object> extends Store<T> {
  /**
   * @param initialValue - The object held until the first `set`.
   * @throws {TypeError} When `initialValue` is not a plain object (an array, a `Map`, `null`…).
   */
  public constructor(initialValue: T) {
    if (!isPlainObject(initialValue)) {
      throw new TypeError(`An ObjectStore holds a plain object, not ${String(initialValue)}`);
    }
    super(initialValue);
  }

  /** The object held now. */
  public get(): T {
    return this.current;
  }

  /**
   * Replaces the object with a copy that has the given fields, then notifies the listeners. A
   * listener that throws does not stop the others; its error is thrown after them, or an
   * `AggregateError` when several threw.
   *
   * @param part - The fields to change, or a function of the current object that returns them.
   * @returns The store, to chain another `set`.
   */
  public set<K extends keyof T>(part: Pick<T, K> | ((current: T) => Pick<T, K>)): this {
    this.hold({ ...this.current, ...(isSomeFunction(part) ? part(this.current) : part) });
    return this;
  }
}
