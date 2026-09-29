import { hasSome } from '@reely/basics';

import { onCleanup } from '../reactive/owner';

/** The events a target dispatches, by type: `keydown` on `window` is a `KeyboardEvent`. */
export type EventMapOf<T extends EventTarget> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : T extends SVGElement
        ? SVGElementEventMap
        : T extends MediaQueryList
          ? MediaQueryListEventMap
          : Record<string, Event>;

/**
 * Adds a typed event listener that goes away with the render that added it, or when the returned
 * function or `options.signal` stops it.
 */
export function listen<T extends EventTarget, K extends keyof EventMapOf<T> & string>(
  target: T,
  type: K,
  handler: (event: EventMapOf<T>[K]) => void,
  options?: AddEventListenerOptions
): VoidFunction;
export function listen(
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options: AddEventListenerOptions = {}
): VoidFunction {
  const controller = new AbortController();
  const signals = hasSome(options.signal) ? [controller.signal, options.signal] : [controller.signal];
  target.addEventListener(type, handler, { ...options, signal: AbortSignal.any(signals) });
  const stop = (): void => controller.abort();
  onCleanup(stop);
  return stop;
}
