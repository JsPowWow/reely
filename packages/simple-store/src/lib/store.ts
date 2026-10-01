import { forEachSettled, hasSome } from '@reely/basics';
import { EventEmitter } from '@reely/emitter';
import type { IEventEmitter, Unsubscribe } from '@reely/emitter';

import type { StoreEvents } from './store.types';

const maxNotifications = 100;

export type Equality<R> = (previous: R, next: R) => boolean;

/** A store to read and follow: a selection, or a store passed to code that must not change it. */
export interface ReadableStore<T> {
  readonly value: T;
  readonly on: IEventEmitter<StoreEvents<T>>['on'];
  readonly off: IEventEmitter<StoreEvents<T>>['off'];
  select<R>(selector: (value: T) => R, equals?: Equality<R>): ReadableStore<R>;
}

/**
 * The `changed` listeners of a store, notified one change at a time: a change made during a
 * notification waits for it to finish, and several such changes arrive once, as the latest.
 */
export abstract class Store<T> implements ReadableStore<T> {
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

  public abstract get value(): T;

  /**
   * A read-only store of a part of the value: it notifies only when the part changes (by `equals`)
   * and follows this store only while it has listeners.
   */
  public select<R>(selector: (value: T) => R, equals: Equality<R> = Object.is): ReadableStore<R> {
    return new SelectedStore(this.on, () => this.value, selector, equals);
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
      forEachSettled(
        this.rounds(),
        () => this.emitter.emit('changed', this.value),
        'Notifications of the store threw'
      );
    } finally {
      this.notifying = false;
      this.changedMeanwhile = false;
    }
  }

  // a notification, then one more whenever a listener changed the store during the last one
  private *rounds(): Generator<void> {
    for (let round = 1; round === 1 || this.changedMeanwhile; round++) {
      if (round > maxNotifications) {
        throw new Error(`The listeners keep changing the store: ${maxNotifications} notifications for one change`, {
          cause: this.value,
        });
      }
      this.changedMeanwhile = false;
      yield;
    }
  }

  private unwatchWhenAlone(): void {
    if (!this.emitter.hasListener('changed')) {
      this.unwatch();
    }
  }
}

interface Followed<R> {
  notified: R;
  readonly stop: Unsubscribe;
}

interface Picked<S, R> {
  readonly from: S;
  readonly part: R;
}

class SelectedStore<S, R> extends Store<R> {
  private followed: Followed<R> | null = null;
  private picked: Picked<S, R> | null = null;

  public constructor(
    private readonly follow: (event: 'changed', listener: () => void) => Unsubscribe,
    private readonly source: () => S,
    private readonly selector: (value: S) => R,
    private readonly equals: Equality<R>
  ) {
    super();
  }

  // picked whenever the store holds another value, so a listener of that store reads the new part
  // before this selection has heard of the change; a part equal to the last one keeps its object
  public get value(): R {
    const from = this.source();
    const last = this.picked;
    if (hasSome(last) && Object.is(last.from, from)) {
      return last.part;
    }
    const part = this.selector(from);
    const picked = { from, part: hasSome(last) && this.equals(last.part, part) ? last.part : part };
    this.picked = picked;
    return picked.part;
  }

  protected override watch(): void {
    // follow before picking, so a selection this one picks from is fresh
    const stop = this.follow('changed', () => {
      const next = this.value;
      if (hasSome(this.followed) && !Object.is(this.followed.notified, next)) {
        this.followed.notified = next;
        this.notify();
      }
    });
    try {
      this.followed = { notified: this.value, stop };
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
