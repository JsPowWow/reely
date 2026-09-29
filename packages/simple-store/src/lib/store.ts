import { EventEmitter } from '@reely/emitter';
import type { IEventEmitter } from '@reely/emitter';

import type { StoreEvents } from './store.types';

/** How many notifications one change may cause before the store takes its listeners for a loop. */
const maxNotifications = 100;

/**
 * What both stores share: the value held and the `changed` listeners, notified one change at a
 * time. A change made while the listeners are being notified waits until every listener has the
 * current one; several such changes reach them once, as the latest value. So each listener gets
 * the values in the order they were held and last gets the value held now.
 *
 * @template T - The value held.
 */
export abstract class Store<T> {
  /** Adds a listener of `changed` and returns the function that removes this subscription. */
  public readonly on: IEventEmitter<StoreEvents<T>>['on'];
  /** Removes a listener of `changed`. */
  public readonly off: IEventEmitter<StoreEvents<T>>['off'];

  protected current: T;
  private readonly emitter = new EventEmitter<StoreEvents<T>>();
  private notifying = false;
  private changedMeanwhile = false;

  protected constructor(initialValue: T) {
    this.current = initialValue;
    this.on = this.emitter.on;
    this.off = this.emitter.off;
  }

  /**
   * Holds `next` and notifies the listeners. A listener that throws does not stop the others or
   * the notifications still due; its error is thrown after them, or an `AggregateError` when
   * several threw.
   */
  protected hold(next: T): void {
    this.current = next;
    if (this.notifying) {
      this.changedMeanwhile = true;
      return;
    }
    this.notifying = true;
    const errors: unknown[] = [];
    try {
      for (let notifications = 1; notifications === 1 || this.changedMeanwhile; notifications++) {
        if (notifications > maxNotifications) {
          throw new Error(`The listeners keep changing the store: ${maxNotifications} notifications for one change`, {
            cause: this.current,
          });
        }
        this.changedMeanwhile = false;
        try {
          this.emitter.emit('changed', this.current);
        } catch (error) {
          errors.push(error);
        }
      }
    } finally {
      this.notifying = false;
      this.changedMeanwhile = false;
    }
    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, `${errors.length} notifications of the store threw`);
    }
  }
}
