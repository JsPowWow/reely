/** A box for a value that arrives later, such as an element once it is created. */
export interface ObjectReference<T> {
  current: T | null;
}

/** A function that gets the value, or `null` when it goes away, as React calls a ref. */
// a method type, so a callback of a narrower value is still a `ReferenceCallback` of the wider one
export type ReferenceCallback<T> = { bivarianceHack(value: T | null): void }['bivarianceHack'];

/** Either kind of reference, or none. */
export type Ref<T> = ObjectReference<T> | ReferenceCallback<T> | null;

/** An empty `ObjectReference`: `current` is `null` until something puts a value in. */
export const createObjectReference = <T>(): ObjectReference<T> => ({ current: null });
