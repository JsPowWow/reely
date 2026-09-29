/** The events of a store: `changed` carries the value it now holds. */
export interface StoreEvents<T> {
  changed: T;
}
