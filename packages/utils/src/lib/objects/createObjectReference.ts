export interface ObjectReference<T> {
  current: T | null;
}
export type ReferenceCallback<T> = { bivarianceHack(instance: T | null): void }['bivarianceHack'];
export type Ref<T> = ReferenceCallback<T> | ObjectReference<T> | null;

export function createObjectReference<T>(): ObjectReference<T> {
  return { current: null };
}
