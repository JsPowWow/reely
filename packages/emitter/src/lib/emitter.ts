import { forEachSettled, isSomeFunction } from '@reely/basics';

import type { EventArguments, EventData, EventsMap, EventType, IEventEmitter, Listener, Unsubscribe } from './types';

type AnyListener = Listener<unknown>;

/** Lets a stale `Unsubscribe` leave a later subscription of the same listener alone. */
type Subscription = object;

/**
 * A typed publish-subscribe channel. An emit calls the listeners it began with and still has;
 * `on`, `off` and `emit` work taken off the emitter.
 */
export class EventEmitter<Events extends EventsMap> implements IEventEmitter<Events> {
  private readonly listeners = new Map<string, Map<AnyListener, Subscription>>();

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

  public readonly off = <Event extends EventType<Events>>(event: Event, listener: Listener<EventData<Events, Event>>): void => {
    if (isSomeFunction<AnyListener>(listener)) {
      this.remove(event, listener);
    }
  };

  public readonly emit = <Event extends EventType<Events>>(
    event: Event,
    ...[data]: EventArguments<EventData<Events, Event>>
  ): void => {
    forEachSettled(
      [...(this.listeners.get(event)?.keys() ?? [])],
      (listener) => {
        if (this.listeners.get(event)?.has(listener) === true) {
          listener(data);
        }
      },
      `Listeners of "${event}" threw`
    );
  };

  public hasListener(event: EventType<Events>): boolean {
    return this.listeners.has(event);
  }

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
