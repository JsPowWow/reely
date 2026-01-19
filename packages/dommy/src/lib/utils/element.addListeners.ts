import type { WithRequiredNonNullable } from '@reely/utils';
import { hasProperty, hasSome, isNonEmpty, isSomeFunction, toNonNullableItems } from '@reely/utils';

import type {
  DOMElementEventHandler,
  DOMElementEventHandlerDescriptor,
  DOMElementEventHandlerProp,
} from '../types/event.types';

type ValidEventListenerDescriptor<Evt extends Event, Elt extends HTMLElement> = Omit<
  WithRequiredNonNullable<DOMElementEventHandlerDescriptor<Evt, Elt>, 'handleEvent'>,
  'handleEvent'
> & {
  handleEvent: EventListener;
};

export function isEventListenerHandler<Evt extends Event, Elt extends HTMLElement>(
  maybeListener: unknown
): maybeListener is DOMElementEventHandlerProp<Evt, Elt> {
  if (Array.isArray(maybeListener)) {
    return maybeListener.every(isEventListenerHandler);
  }
  return isSomeFunction(maybeListener) || isEventListenerDescriptor(maybeListener);
}

export function addListener<Evt extends Event, Elt extends HTMLElement>(
  handleEvent: DOMElementEventHandler<Evt, Elt>,
  options?: AddEventListenerOptions
): DOMElementEventHandlerDescriptor<Evt, Elt>[] {
  return [{ handleEvent, ...options }];
}

export function addListeners<Evt extends Event, Elt extends HTMLElement>(
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

function isEventListenerDescriptor<Evt extends Event, Elt extends HTMLElement>(
  maybeDescriptor: unknown
): maybeDescriptor is ValidEventListenerDescriptor<Evt, Elt> {
  return (
    hasSome(maybeDescriptor) &&
    hasProperty('handleEvent', maybeDescriptor) &&
    isSomeFunction(maybeDescriptor.handleEvent)
  );
}

// function isEventListenerOrEventListenerObject(value: unknown): value is EventListenerOrEventListenerObject {
//   return isSomeFunction(value) || (hasProperty('handleEvent', value) && isSomeFunction(value.handleEvent));
// }

export function addEventListenerHandler<Evt extends Event, Elt extends HTMLElement>(
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
  if (isSomeFunction<EventListener>(eventHandler)) {
    element.addEventListener(eventType, eventHandler, {
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
