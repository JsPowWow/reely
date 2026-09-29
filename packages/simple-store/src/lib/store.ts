import { EventEmitter } from '@reely/emitter';
import type { IEventEmitter, Unsubscribe } from '@reely/emitter';
import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import type { StoreEvents } from './store.types';

/** How many notifications one change may cause before the store takes its listeners for a loop. */
const maxNotifications = 100;

/** Whether two selected values are the same, so the listeners of a selection need no notice. */
export type Equality<R> = (previous: R, next: R) => boolean;

/**
 * A read-only store of a part of another store's value, made by `select`. It notifies its
 * `changed` listeners only when the part changes, and follows the other store only while it has
 * listeners; without them it holds no subscription and `value` picks the part afresh.
 *
 * @template R - The part selected.
 */
export interface StoreSelection<R> {
  /** The part of the other store's value held now. */
  readonly value: R;
  /** Adds a listener of `changed` and returns the function that removes this subscription. */
  readonly on: IEventEmitter<StoreEvents<R>>['on'];
  /** Removes a listener of `changed`. */
  readonly off: IEventEmitter<StoreEvents<R>>['off'];
  /** Selects a part of this part: see `select` of a store. */
  select<Q>(selector: (value: R) => Q, equals?: Equality<Q>): StoreSelection<Q>;
}

/**
 * What every store shares: the `changed` listeners, notified one change at a time. A change made
 * while the listeners are being notified waits until every listener has the current value;
 * several such changes reach them once, as the latest. So each listener gets the values in the
 * order they were held and last gets the value held now.
 *
 * @template T - The value held.
 */
export abstract class Store<T> {
  /** Adds a listener of `changed` and returns the function that removes this subscription. */
  public readonly on: IEventEmitter<StoreEvents<T>>['on'];
  /** Removes a listener of `changed`. */
  public readonly off: IEventEmitter<StoreEvents<T>>['off'];

  private readonly emitter = new EventEmitter<StoreEvents<T>>();
  private notifying = false;
  private changedMeanwhile = false;

  protected constructor() {
    this.on = (event, listener): Unsubscribe => {
      const watched = this.emitter.hasListener(event);
      const unsubscribe = this.emitter.on(event, listener);
      if (!watched) {
        try {
          this.watch();
        } catch (error) {
          unsubscribe();
          throw error;
        }
      }
      return (): void => {
        unsubscribe();
        this.unwatchWhenAlone();
      };
    };
    this.off = (event, listener): void => {
      this.emitter.off(event, listener);
      this.unwatchWhenAlone();
    };
  }

  /**
   * A read-only store of a part of this one's value: it notifies its listeners only when that part
   * changes, and follows this store only while it has listeners. To read a part once, call the
   * selector on the value instead.
   *
   * @param selector - Picks the part; called while the selection is read or listened to.
   * @param equals - Whether two parts are the same; `Object.is` by default.
   */
  public select<R>(selector: (value: T) => R, equals: Equality<R> = Object.is): StoreSelection<R> {
    return new SelectedStore(this.on, () => selector(this.read()), equals);
  }

  /** Called when the store gets its first listener; a throw takes that listener back. */
  protected watch(): void {
    // a store that holds its own value has nothing to follow
  }

  /** Called when the store loses its last listener. */
  protected unwatch(): void {
    // a store that holds its own value has nothing to follow
  }

  /**
   * Notifies the listeners of the value held now. A listener that throws does not stop the others
   * or the notifications still due; its error is thrown after them, or an `AggregateError` when
   * several threw.
   */
  protected notify(): void {
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
            cause: this.read(),
          });
        }
        this.changedMeanwhile = false;
        try {
          this.emitter.emit('changed', this.read());
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

  private unwatchWhenAlone(): void {
    if (!this.emitter.hasListener('changed')) {
      this.unwatch();
    }
  }

  /** The value held now. */
  protected abstract read(): T;
}

/** A selection while it follows its store: the part its listeners have, and how to stop. */
interface Followed<R> {
  value: R;
  readonly stop: Unsubscribe;
}

/** The store `select` makes. */
class SelectedStore<R> extends Store<R> implements StoreSelection<R> {
  private followed: Nullable<Followed<R>> = null;

  public constructor(
    private readonly follow: (event: 'changed', listener: () => void) => Unsubscribe,
    private readonly pick: () => R,
    private readonly equals: Equality<R>
  ) {
    super();
  }

  public get value(): R {
    return this.read();
  }

  protected read(): R {
    return hasSome(this.followed) ? this.followed.value : this.pick();
  }

  protected override watch(): void {
    // follow first, so a selection this one picks from is followed, and fresh, too
    const stop = this.follow('changed', () => {
      const next = this.pick();
      if (hasSome(this.followed) && !this.equals(this.followed.value, next)) {
        this.followed.value = next;
        this.notify();
      }
    });
    try {
      this.followed = { value: this.pick(), stop };
    } catch (error) {
      stop();
      throw error;
    }
  }

  protected override unwatch(): void {
    this.followed?.stop();
    this.followed = null;
  }
}
