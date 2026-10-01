import { isPlainObject, isSomeFunction } from '@reely/basics';

import { ValueStore } from './valueStore';

const requirePlainObject = <T extends object>(value: T): T => {
  if (!isPlainObject(value)) {
    throw new TypeError(`An ObjectStore holds a plain object, not ${String(value)}`);
  }
  return value;
};

const changesSome = (before: object, fields: object): boolean =>
  Reflect.ownKeys(fields).some(
    (key) => !Object.hasOwn(before, key) || !Object.is(Reflect.get(fields, key), Reflect.get(before, key))
  );

/**
 * A `ValueStore` of a plain object, whose fields `set` changes a few at a time: it makes a new
 * object when a field it is given differs (by `Object.is`), and notifies.
 */
export class ObjectStore<T extends object> extends ValueStore<T> {
  /** @throws {TypeError} When `initialValue` is not a plain object. */
  public constructor(initialValue: T) {
    super(requirePlainObject(initialValue));
  }

  // an accessor overridden by its setter alone would lose its getter
  public override get value(): Readonly<T> {
    return super.value;
  }

  /** Replaces the whole object, notifying when it is another one. @throws {TypeError} When `next` is not a plain object. */
  public override set value(next: Readonly<T>) {
    super.value = requirePlainObject(next);
  }

  /** Copies the object with the fields of `part` (or of what it returns) and notifies, unless every field is the same. */
  public set<K extends keyof T>(part: Pick<T, K> | ((current: Readonly<T>) => Pick<T, K>)): this {
    const before = this.value;
    const fields = isSomeFunction(part) ? part(before) : part;
    if (changesSome(before, fields)) {
      this.value = { ...before, ...fields };
    }
    return this;
  }
}
