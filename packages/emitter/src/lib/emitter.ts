import { isSomeFunction } from '@reely/utils';

import type { EventArguments, EventData, EventsMap, EventType, IEventEmitter, Listener, Unsubscribe } from './types';

/** A listener as stored: the map holds the listeners of every event, whatever their data. */
type AnyListener = Listener<unknown>;

/** Marks one subscription, so its `Unsubscribe` cannot remove a later one of the same listener. */
type Subscription = object;

/**
 * A typed publish-subscribe channel. An emit calls the listeners the event had when it began and
 * still has, so one added meanwhile waits for the next emit and one removed meanwhile is skipped.
 * `on`, `off` and `emit` keep working when taken off the emitter.
 *
 * @template Events - The events, by name, with the type of their data.
 */
export class EventEmitter<Events extends EventsMap> implements IEventEmitter<Events> {
  private readonly listeners = new Map<string, Map<AnyListener, Subscription>>();

  /** @inheritDoc IEventEmitter.on */
  public readonly on = <Event extends EventType<Events>>(
    event: Event,
    listener: Listener<EventData<Events, Event>>
  ): Unsubscribe => {
    if (!isSomeFunction<AnyListener>(listener)) {
      throw new TypeError(`The listener of "${event}" is not a function`);
    }
    const subscriptions = this.listeners.get(event) ?? new Map<AnyListener, Subscription>();
    const subscription = subscriptions.get(listener) ?? {};
    subscriptions.set(listener, subscription);
    this.listeners.set(event, subscriptions);
    return (): void => {
      if (this.listeners.get(event)?.get(listener) === subscription) {
        this.remove(event, listener);
      }
    };
  };

  /** @inheritDoc IEventEmitter.off */
  public readonly off = <Event extends EventType<Events>>(event: Event, listener: Listener<EventData<Events, Event>>): void => {
    if (isSomeFunction<AnyListener>(listener)) {
      this.remove(event, listener);
    }
  };

  /** @inheritDoc IEventEmitter.emit */
  public readonly emit = <Event extends EventType<Events>>(
    event: Event,
    ...[data]: EventArguments<EventData<Events, Event>>
  ): void => {
    const errors: unknown[] = [];
    for (const listener of [...(this.listeners.get(event)?.keys() ?? [])]) {
      if (this.listeners.get(event)?.has(listener) === true) {
        try {
          listener(data);
        } catch (error) {
          errors.push(error);
        }
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, `${errors.length} listeners of "${event}" threw`);
    }
  };

  /** Whether `event` has a listener. */
  public hasListener(event: EventType<Events>): boolean {
    return this.listeners.has(event);
  }

  /** Removes the listeners of every event, including those an emit in progress has yet to call. */
  public clearAllListeners(): void {
    this.listeners.clear();
  }

  private remove(event: string, listener: AnyListener): void {
    const subscriptions = this.listeners.get(event);
    subscriptions?.delete(listener);
    if (subscriptions?.size === 0) {
      this.listeners.delete(event);
    }
  }
}
