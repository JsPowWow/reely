export type DOMElementEvent<Evt extends Event, Elt extends HTMLElement> = Omit<Evt, 'currentTarget'> &
  Readonly<{ currentTarget: Elt }>;

export type DOMElementEvents<T extends HTMLElement> = {
  [K in keyof GlobalEventHandlersEventMap]?: DOMElementEventHandlerProp<GlobalEventHandlersEventMap[K], T>;
};

export type DOMElementEventHandler<Evt extends Event, Elt extends HTMLElement> = (
  event: DOMElementEvent<Evt, Elt>
) => void;

export type DOMElementEventHandlerOptions = AddEventListenerOptions & EventListenerOptions;

export type DOMElementEventHandlerDescriptor<Evt extends Event, Elt extends HTMLElement> = {
  handleEvent: DOMElementEventHandler<Evt, Elt>;
} & DOMElementEventHandlerOptions;

export type DOMElementEventHandlerProp<Evt extends Event, Elt extends HTMLElement> =
  | DOMElementEventHandler<Evt, Elt>
  | DOMElementEventHandlerDescriptor<Evt, Elt>
  | readonly DOMElementEventHandlerProp<Evt, Elt>[];
