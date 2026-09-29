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
 * Adds an event listener that goes away with the render that added it: `window` and `document`
 * listeners of a view stop when the view is disposed. Outside a render it stays until stopped.
 *
 * @template T - The event target.
 * @template K - The event type.
 * @param {T} target - Where to listen: `window`, `document`, an element, a media query list.
 * @param {K} type - The event type.
 * @param {(event: EventMapOf<T>[K]) => void} handler - Called with the typed event.
 * @param {AddEventListenerOptions} [options] - Listener options; its `signal` stops it too.
 * @returns {VoidFunction} Removes the listener now.
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
  const signals = options.signal ? [controller.signal, options.signal] : [controller.signal];
  target.addEventListener(type, handler, { ...options, signal: AbortSignal.any(signals) });
  const stop = (): void => controller.abort();
  onCleanup(stop);
  return stop;
}
