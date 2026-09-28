import type { DommyElement } from './dommy.types';
/** Any DOM event a handler prop can receive. */
export type DOMElementEventType = Event;

export type DOMElementEvent<Evt extends DOMElementEventType, Elt extends DommyElement> = Omit<Evt, 'currentTarget'> &
  Readonly<{ currentTarget: Elt }>;

/**
 * Handler props of an element: `onclick` and its camelCase form `onClick`.
 */
export type DOMElementEvents<T extends DommyElement> = {
  [K in HandlerName as K | CamelCaseHandlerName<K>]?: DOMElementEventHandlerProp<HandlerEvent<K>, T>;
};

type HandlerName = Extract<keyof GlobalEventHandlers, `on${string}`>;

/** The event a handler receives: `PointerEvent` for `onclick`, `KeyboardEvent` for `onkeydown`. */
type HandlerEvent<K extends HandlerName> =
  NonNullable<GlobalEventHandlers[K]> extends (event: infer Evt) => unknown ? Extract<Evt, Event> : never;

type CamelCaseHandlerName<K> = K extends `on${infer EventType}` ? `on${Capitalize<EventType>}` : never;

export type DOMElementEventHandler<Evt extends DOMElementEventType, Elt extends DommyElement> = (
  event: DOMElementEvent<Evt, Elt>
) => void;

export type DOMElementEventHandlerOptions = AddEventListenerOptions & EventListenerOptions;

export type DOMElementEventHandlerDescriptor<Evt extends DOMElementEventType, Elt extends DommyElement> = {
  handleEvent: DOMElementEventHandler<Evt, Elt>;
} & DOMElementEventHandlerOptions;

export type DOMElementEventHandlerProp<Evt extends DOMElementEventType, Elt extends DommyElement> =
  | DOMElementEventHandler<Evt, Elt>
  | DOMElementEventHandlerDescriptor<Evt, Elt>
  | readonly DOMElementEventHandlerProp<Evt, Elt>[];
