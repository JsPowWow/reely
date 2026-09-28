import type { WithRequiredNonNullable } from '@reely/utils';
import { hasProperty, hasSome, isNonEmpty, isSomeFunction, toNonNullableItems } from '@reely/utils';

import type {
  DOMElementEventHandler,
  DOMElementEventHandlerDescriptor,
  DOMElementEventHandlerProp,
  DOMElementEventType,
} from '../types/event.types';

type ValidEventListenerDescriptor<Evt extends DOMElementEventType, Elt extends HTMLElement> = Omit<
  WithRequiredNonNullable<DOMElementEventHandlerDescriptor<Evt, Elt>, 'handleEvent'>,
  'handleEvent'
> & {
  handleEvent: EventListener;
};

export function isEventListenerHandler<Evt extends DOMElementEventType, Elt extends HTMLElement>(
  maybeEventType: string,
  maybeListener: unknown
): maybeListener is DOMElementEventHandlerProp<Evt, Elt> {
  if (Array.isArray(maybeListener)) {
    return maybeListener.every((listener) => isEventListenerHandler(maybeEventType, listener));
  }
  return maybeEventType.startsWith('on') && (isSomeFunction(maybeListener) || isEventListenerDescriptor(maybeListener));
}

/**
 * Converts a handler property name to its DOM event type: `onclick` and `onClick` → `click`.
 *
 * @param {string} handlerProperty - The `on*` property name.
 * @returns {string} The event type to listen to.
 */
export const toEventType = (handlerProperty: string): string => handlerProperty.slice(2).toLowerCase();

export function addListener<Evt extends DOMElementEventType, Elt extends HTMLElement>(
  handleEvent: DOMElementEventHandler<Evt, Elt>,
  options?: AddEventListenerOptions
): DOMElementEventHandlerDescriptor<Evt, Elt>[] {
  return [{ handleEvent, ...options }];
}

export function addListeners<Evt extends DOMElementEventType, Elt extends HTMLElement>(
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

export function addEventListenerHandler<Evt extends DOMElementEventType, Elt extends HTMLElement>(
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

function isEventListenerDescriptor<Evt extends DOMElementEventType, Elt extends HTMLElement>(
  maybeDescriptor: unknown
): maybeDescriptor is ValidEventListenerDescriptor<Evt, Elt> {
  return (
    hasSome(maybeDescriptor) &&
    hasProperty('handleEvent', maybeDescriptor) &&
    isSomeFunction(maybeDescriptor.handleEvent)
  );
}
