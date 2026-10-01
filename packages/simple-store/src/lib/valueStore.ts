import { Store } from './store';

/** A value that notifies when a different one (by `Object.is`) is set; reads are read-only. */
export class ValueStore<T> extends Store<Readonly<T>> {
  private current: Readonly<T>;

  public constructor(initialValue: T) {
    super();
    this.current = initialValue;
  }

  public get value(): Readonly<T> {
    return this.current;
  }

  public set value(next: Readonly<T>) {
    if (!Object.is(next, this.current)) {
      this.current = next;
      this.notify();
    }
  }
}
