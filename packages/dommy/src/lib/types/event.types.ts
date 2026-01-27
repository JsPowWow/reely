import type { ValueOf } from '@reely/utils';

export type DOMElementEventType = ValueOf<GlobalEventHandlers>;

export type DOMElementEvent<Evt extends DOMElementEventType, Elt extends HTMLElement> = Omit<Evt, 'currentTarget'> &
  Readonly<{ currentTarget: Elt }>;

export type DOMElementEvents<T extends HTMLElement> = {
  [K in keyof GlobalEventHandlers]?: DOMElementEventHandlerProp<GlobalEventHandlers[K], T>;
};

export type DOMElementEventHandler<Evt extends DOMElementEventType, Elt extends HTMLElement> = (
  event: DOMElementEvent<Evt, Elt>
) => void;

export type DOMElementEventHandlerOptions = AddEventListenerOptions & EventListenerOptions;

export type DOMElementEventHandlerDescriptor<Evt extends DOMElementEventType, Elt extends HTMLElement> = {
  handleEvent: DOMElementEventHandler<Evt, Elt>;
} & DOMElementEventHandlerOptions;

export type DOMElementEventHandlerProp<Evt extends DOMElementEventType, Elt extends HTMLElement> =
  | DOMElementEventHandler<Evt, Elt>
  | DOMElementEventHandlerDescriptor<Evt, Elt>
  | readonly DOMElementEventHandlerProp<Evt, Elt>[];
