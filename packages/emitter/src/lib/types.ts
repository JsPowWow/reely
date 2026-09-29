/** Event names with the type of their data (`undefined` for none); an `interface` fits. */
export type EventsMap = object;

export type EventType<Events extends EventsMap> = string & keyof Events;

export type EventData<Events extends EventsMap, Event extends EventType<Events>> = Events[Event];

export type Listener<Data> = (data: Data) => void;

/** Removes its own subscription only; calling it again does nothing. */
export type Unsubscribe = () => void;

/** `emit` data: optional when it may be `undefined`, required otherwise. */
export type EventArguments<Data> = undefined extends Data ? [data?: Data] : [data: Data];

export interface IEventEmitter<Events extends EventsMap> {
  /** Adds a listener; one it already has is not added twice, as with `addEventListener`. */
  on: <Event extends EventType<Events>>(event: Event, listener: Listener<EventData<Events, Event>>) => Unsubscribe;
  off: <Event extends EventType<Events>>(event: Event, listener: Listener<EventData<Events, Event>>) => void;
  /** Errors of listeners are thrown after all have run: one as is, several as `AggregateError`. */
  emit: <Event extends EventType<Events>>(event: Event, ...data: EventArguments<EventData<Events, Event>>) => void;
}
