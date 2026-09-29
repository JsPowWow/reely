import { hasSome, isSomeFunction } from '@reely/basics';
import type { WithRequiredNonNullable } from '@reely/utils';
import { hasProperty, isNonEmpty, toNonNullableItems } from '@reely/utils';

import type { DommyElement } from '../types/dommy.types';
import type {
  DOMElementEventHandler,
  DOMElementEventHandlerDescriptor,
  DOMElementEventHandlerProp,
  DOMElementEventType,
} from '../types/event.types';

type ValidEventListenerDescriptor<Evt extends DOMElementEventType, Elt extends DommyElement> = Omit<
  WithRequiredNonNullable<DOMElementEventHandlerDescriptor<Evt, Elt>, 'handleEvent'>,
  'handleEvent'
> & {
  handleEvent: EventListener;
};

export function isEventListenerHandler<Evt extends DOMElementEventType, Elt extends DommyElement>(
  maybeEventType: string,
  maybeListener: unknown
): maybeListener is DOMElementEventHandlerProp<Evt, Elt> {
  if (Array.isArray(maybeListener)) {
    return maybeListener.every((listener) => isEventListenerHandler(maybeEventType, listener));
  }
  return (
    isEventHandlerName(maybeEventType) && (isSomeFunction(maybeListener) || isEventListenerDescriptor(maybeListener))
  );
}

export const isEventHandlerName = (property: string): property is `on${string}` => property.startsWith('on');

export const toEventType = (handlerProperty: string): string => handlerProperty.slice(2).toLowerCase();

export function addListener<Evt extends DOMElementEventType, Elt extends DommyElement>(
  handleEvent: DOMElementEventHandler<Evt, Elt>,
  options?: AddEventListenerOptions
): DOMElementEventHandlerDescriptor<Evt, Elt>[] {
  return [{ handleEvent, ...options }];
}

export function addListeners<Evt extends DOMElementEventType, Elt extends DommyElement>(
  ...args: (
    | [DOMElementEventHandler<Evt, Elt>, AddEventListenerOptions]
    | [DOMElementEventHandler<Evt, Elt>]
    | DOMElementEventHandler<Evt, Elt>
  )[]
): DOMElementEventHandlerDescriptor<Evt, Elt>[] {
  return toNonNullableItems(
    args.map((entry) => {
      if (Array.isArray(entry)) {
        const [handleEvent, options] = entry;
        return { handleEvent, ...options };
      }
      if (isSomeFunction(entry)) {
        return { handleEvent: entry };
      }
      return null;
    })
  );
}

// method parameters compare both ways: the DOM dispatches to a handler the event of its own type
type DispatchedListener = { handle(event: Event): void }['handle'];

export function addEventListenerHandler<Evt extends DOMElementEventType, Elt extends DommyElement>(
  element: Elt,
  eventType: string,
  eventHandler: DOMElementEventHandlerProp<Evt, Elt>,
  eventListenersAbortSignal?: AbortSignal
): boolean {
  if (Array.isArray(eventHandler) && isNonEmpty(eventHandler)) {
    eventHandler.forEach((listener) =>
      addEventListenerHandler(element, eventType, listener, eventListenersAbortSignal)
    );
    return true;
  }
  if (isSomeFunction(eventHandler)) {
    const listener: DispatchedListener = eventHandler;
    element.addEventListener(eventType, listener, {
      signal: eventListenersAbortSignal,
    });
    return true;
  }

  if (isEventListenerDescriptor(eventHandler)) {
    const { handleEvent, signal: handlerSignal, once, capture, passive } = eventHandler;
    element.addEventListener(eventType, handleEvent, {
      signal: AbortSignal.any(toNonNullableItems([handlerSignal, eventListenersAbortSignal])),
      once,
      capture,
      passive,
    });

    return true;
  }

  return false;
}

function isEventListenerDescriptor<Evt extends DOMElementEventType, Elt extends DommyElement>(
  maybeDescriptor: unknown
): maybeDescriptor is ValidEventListenerDescriptor<Evt, Elt> {
  return (
    hasSome(maybeDescriptor) &&
    hasProperty('handleEvent', maybeDescriptor) &&
    isSomeFunction(maybeDescriptor.handleEvent)
  );
}
