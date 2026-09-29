import { isPlainObject, isSomeFunction } from '@reely/basics';

import { Store } from './store';

/** A plain object that changes a few fields at a time; each `set` makes a new object and notifies. */
export class ObjectStore<T extends object> extends Store<T> {
  private current: T;

  /** @throws {TypeError} When `initialValue` is not a plain object. */
  public constructor(initialValue: T) {
    if (!isPlainObject(initialValue)) {
      throw new TypeError(`An ObjectStore holds a plain object, not ${String(initialValue)}`);
    }
    super();
    this.current = initialValue;
  }

  public get(): T {
    return this.current;
  }

  /** Copies the object with the fields of `part` (or of what it returns) and notifies. */
  public set<K extends keyof T>(part: Pick<T, K> | ((current: T) => Pick<T, K>)): this {
    this.current = { ...this.current, ...(isSomeFunction(part) ? part(this.current) : part) };
    this.notify();
    return this;
  }

  protected read(): T {
    return this.current;
  }
}
