import { Store } from './store';

/**
 * A value that says when it changes: setting a different one, as `Object.is` compares them,
 * notifies the `changed` listeners with it; setting the same one does nothing. A value set by a
 * listener reaches the listeners once they all have the current one.
 *
 * @template T - The value held.
 */
export class PrimitiveStore<T> extends Store<T> {
  /** @param initialValue - The value held until a different one is set. */
  public constructor(initialValue: T) {
    super(initialValue);
  }

  /** The value held now. */
  public get value(): T {
    return this.current;
  }

  /**
   * Holds `next` and notifies the listeners, unless it is the value held now. A listener that
   * throws does not stop the others; its error is thrown after them, or an `AggregateError` when
   * several threw.
   */
  public set value(next: T) {
    if (!Object.is(next, this.current)) {
      this.hold(next);
    }
  }
}
