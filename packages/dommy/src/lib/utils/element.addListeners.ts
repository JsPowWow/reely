import { isSomeFunction } from '@reely/basics';
import type { Bivariant, Nullable } from '@reely/utils';
import { hasProperty, isBoolean, isInstanceOf, isNil, isNonEmpty, toNonNullableItems } from '@reely/utils';

import type { DommyElement } from '../types/dommy.types';
import type {
  DOMElementEventHandler,
  DOMElementEventHandlerDescriptor,
  DOMElementEventType,
} from '../types/event.types';

// what `addListener` builds, checked field by field: props reach dommy untyped
type ListenerDescriptor = {
  handleEvent: Bivariant<EventListener>;
  signal?: Nullable<AbortSignal>;
  once?: Nullable<boolean>;
  capture?: Nullable<boolean>;
  passive?: Nullable<boolean>;
};

const listenerFlags = ['once', 'capture', 'passive'] as const;

function isListenerDescriptor(maybeDescriptor: unknown): maybeDescriptor is ListenerDescriptor {
  return (
    hasProperty('handleEvent', maybeDescriptor) &&
    isSomeFunction(maybeDescriptor.handleEvent) &&
    (!hasProperty('signal', maybeDescriptor) ||
      isNil(maybeDescriptor.signal) ||
      isInstanceOf(AbortSignal, maybeDescriptor.signal)) &&
    listenerFlags.every(
      (flag) => !hasProperty(flag, maybeDescriptor) || isNil(maybeDescriptor[flag]) || isBoolean(maybeDescriptor[flag])
    )
  );
}

/** Whether `maybeListener` in an `on*` prop is a handler, a descriptor from `addListener`, or a list of them. */
export function isEventListenerHandler(maybeEventType: string, maybeListener: unknown): boolean {
  if (Array.isArray(maybeListener)) {
    return maybeListener.every((listener) => isEventListenerHandler(maybeEventType, listener));
  }
  return isEventHandlerName(maybeEventType) && (isSomeFunction(maybeListener) || isListenerDescriptor(maybeListener));
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

export function addEventListenerHandler(
  element: DommyElement,
  eventType: string,
  eventHandler: unknown,
  eventListenersAbortSignal?: AbortSignal
): boolean {
  if (Array.isArray(eventHandler) && isNonEmpty(eventHandler)) {
    eventHandler.forEach((listener) =>
      addEventListenerHandler(element, eventType, listener, eventListenersAbortSignal)
    );
    return true;
  }
  if (isSomeFunction(eventHandler)) {
    const listener: Bivariant<EventListener> = eventHandler;
    element.addEventListener(eventType, listener, { signal: eventListenersAbortSignal });
    return true;
  }
  if (isListenerDescriptor(eventHandler)) {
    const { handleEvent, signal: handlerSignal, once, capture, passive } = eventHandler;
    element.addEventListener(eventType, handleEvent, {
      signal: AbortSignal.any(toNonNullableItems([handlerSignal, eventListenersAbortSignal])),
      once: once ?? undefined,
      capture: capture ?? undefined,
      passive: passive ?? undefined,
    });
    return true;
  }
  return false;
}
