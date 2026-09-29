import { forEachSettled, hasSome } from '@reely/basics';
import { EventEmitter } from '@reely/emitter';
import type { IEventEmitter, Unsubscribe } from '@reely/emitter';

import type { StoreEvents } from './store.types';

const maxNotifications = 100;

export type Equality<R> = (previous: R, next: R) => boolean;

/** A read-only store of a part of another store's value, made by `select`. */
export interface StoreSelection<R> {
  readonly value: R;
  readonly on: IEventEmitter<StoreEvents<R>>['on'];
  readonly off: IEventEmitter<StoreEvents<R>>['off'];
  select<Q>(selector: (value: R) => Q, equals?: Equality<Q>): StoreSelection<Q>;
}

/**
 * The `changed` listeners of a store, notified one change at a time: a change made during a
 * notification waits for it to finish, and several such changes arrive once, as the latest.
 */
export abstract class Store<T> {
  public readonly on: IEventEmitter<StoreEvents<T>>['on'];
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
   * A read-only store of a part of the value: it notifies only when the part changes (by `equals`)
   * and follows this store only while it has listeners.
   */
  public select<R>(selector: (value: T) => R, equals: Equality<R> = Object.is): StoreSelection<R> {
    return new SelectedStore(this.on, () => selector(this.read()), equals);
  }

  /** Called on the first listener; a throw takes that listener back. */
  protected watch(): void {
    // only a selection follows another store
  }

  /** Called when the last listener leaves. */
  protected unwatch(): void {
    // only a selection follows another store
  }

  /** Errors of listeners are thrown after all have run: one as is, several as `AggregateError`. */
  protected notify(): void {
    if (this.notifying) {
      this.changedMeanwhile = true;
      return;
    }
    this.notifying = true;
    try {
      forEachSettled(this.rounds(), () => this.emitter.emit('changed', this.read()), 'Notifications of the store threw');
    } finally {
      this.notifying = false;
      this.changedMeanwhile = false;
    }
  }

  /** One round per change made during the notification before it. */
  private *rounds(): Generator<number> {
    for (let round = 1; round === 1 || this.changedMeanwhile; round++) {
      if (round > maxNotifications) {
        throw new Error(`The listeners keep changing the store: ${maxNotifications} notifications for one change`, {
          cause: this.read(),
        });
      }
      this.changedMeanwhile = false;
      yield round;
    }
  }

  private unwatchWhenAlone(): void {
    if (!this.emitter.hasListener('changed')) {
      this.unwatch();
    }
  }

  protected abstract read(): T;
}

interface Followed<R> {
  value: R;
  readonly stop: Unsubscribe;
}

class SelectedStore<R> extends Store<R> implements StoreSelection<R> {
  private followed: Followed<R> | null = null;

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
    // follow before picking, so a selection this one picks from is fresh
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
