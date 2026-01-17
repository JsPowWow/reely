import { hasProperty, hasSome, isNonEmpty, isSomeFunction, toNonNullableItems } from '@reely/utils';
import type { Prettify, WithRequiredNonNullable } from '@reely/utils';

import type {
  DOMElementEventHandler,
  DOMElementEventHandlerDescriptor,
  DOMElementEventHandlerProp,
} from '../types/event.types';

type ValidEventListenerDescriptor<Evt extends Event, Elt extends HTMLElement> = Omit<
  Prettify<WithRequiredNonNullable<DOMElementEventHandlerDescriptor<Evt, Elt>, 'handler'>>,
  'handler'
> & {
  handler: EventListener;
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
  handler: DOMElementEventHandler<Evt, Elt>,
  options?: AddEventListenerOptions
): DOMElementEventHandlerDescriptor<Evt, Elt>[] {
  return [{ handler, ...options }];
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
        const [handler, options] = entry;
        return { handler, ...options };
      }
      if (isSomeFunction(entry)) {
        return { handler: entry };
      }
      return null;
    })
  );
}

function isEventListenerDescriptor<Evt extends Event, Elt extends HTMLElement>(
  maybeDescriptor: unknown
): maybeDescriptor is ValidEventListenerDescriptor<Evt, Elt> {
  return hasSome(maybeDescriptor) && hasProperty('handler', maybeDescriptor) && isSomeFunction(maybeDescriptor.handler);
}

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
  if (isSomeFunction(eventHandler)) {
    element.addEventListener(eventType, eventHandler, { signal: eventListenersAbortSignal });
    return true;
  }

  if (isEventListenerDescriptor(eventHandler)) {
    const { handler, signal: handlerSignal, once, capture, passive } = eventHandler;
    element.addEventListener(eventType, handler, {
      signal: AbortSignal.any(toNonNullableItems([handlerSignal, eventListenersAbortSignal])),
      once,
      capture,
      passive,
    });

    return true;
  }

  return false;
}
