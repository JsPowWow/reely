import { Store } from './store';

/** A value that notifies when a different one (by `Object.is`) is set. */
export class PrimitiveStore<T> extends Store<T> {
  private current: T;

  public constructor(initialValue: T) {
    super();
    this.current = initialValue;
  }

  public get value(): T {
    return this.current;
  }

  public set value(next: T) {
    if (!Object.is(next, this.current)) {
      this.current = next;
      this.notify();
    }
  }

  protected read(): T {
    return this.current;
  }
}
