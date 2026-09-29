/**
 * The events of an emitter: each event name with the type of its data (`undefined` for none).
 * An `interface` fits as well as a type literal.
 */
export type EventsMap = object;

/** The name of an event of `Events`. */
export type EventType<Events extends EventsMap> = string & keyof Events;

/** The data an event carries. */
export type EventData<Events extends EventsMap, Event extends EventType<Events>> = Events[Event];

/** A listener of an event: called with its data. */
export type Listener<Data> = (data: Data) => void;

/** Removes the subscription that returned it; calling it again, or after the listener left, does nothing. */
export type Unsubscribe = () => void;

/** The data argument of `emit`: optional for an event whose data may be `undefined`, required otherwise. */
export type EventArguments<Data> = undefined extends Data ? [data?: Data] : [data: Data];

/**
 * A typed publish-subscribe channel.
 *
 * @template Events - The events, by name, with the type of their data.
 */
export interface IEventEmitter<Events extends EventsMap> {
  /**
   * Adds a listener of `event`; adding one it already has changes nothing, as `addEventListener`.
   *
   * @returns The function that removes this subscription.
   */
  on: <Event extends EventType<Events>>(event: Event, listener: Listener<EventData<Events, Event>>) => Unsubscribe;
  /** Removes a listener of `event`, whichever subscription added it. */
  off: <Event extends EventType<Events>>(event: Event, listener: Listener<EventData<Events, Event>>) => void;
  /**
   * Calls the listeners of `event` with its data, synchronously, in the order they were added.
   * A listener that throws does not stop the others; afterwards its error is thrown, or an
   * `AggregateError` of all of them when several threw.
   */
  emit: <Event extends EventType<Events>>(event: Event, ...data: EventArguments<EventData<Events, Event>>) => void;
}
