import { hasSome } from '@reely/basics';
import { onCleanup } from '@reely/signals';
import type { Nullable } from '@reely/utils';

import { listen } from './listen';

/** What one held press does as its pointer moves and lets go. */
export interface HeldPress {
  move?: (event: PointerEvent) => void;
  up?: (event: PointerEvent) => void;
}

/** How `hold` treats the presses it holds. */
export interface HoldOptions {
  /** Calls `preventDefault()` on the `pointerdown` of each press it holds, not of those it leaves alone. */
  prevent?: boolean;
}

/**
 * Holds a press on `element`: `press` gets the `pointerdown` and returns what this press does, or
 * nothing to leave it alone. The pointer is captured, so its moves and release reach `element` off
 * it too, and `up` runs once, on `pointerup`, `pointercancel` or a lost capture. One pointer at a
 * time. A touch pans the page unless `element` has `touch-action: none`. It stops with the render
 * that made it, or by the function it returns, which lets go of a press without `up`.
 */
export const hold = (
  element: HTMLElement | SVGElement,
  press: (event: PointerEvent) => HeldPress | void,
  { prevent = false }: HoldOptions = {}
): VoidFunction => {
  let held: Nullable<{ readonly pointerId: number; readonly press: HeldPress }> = null;
  const stops = [
    listen(element, 'pointerdown', (event) => {
      if (hasSome(held)) {
        return;
      }
      const pressed = press(event);
      if (hasSome(pressed)) {
        if (prevent) {
          event.preventDefault();
        }
        element.setPointerCapture(event.pointerId);
        held = { pointerId: event.pointerId, press: pressed };
      }
    }),
    listen(element, 'pointermove', (event) => {
      if (held?.pointerId === event.pointerId) {
        held.press.move?.(event);
      }
    }),
    listen(element, ['pointerup', 'pointercancel', 'lostpointercapture'], (event) => {
      if (held?.pointerId === event.pointerId) {
        const { up } = held.press;
        held = null;
        up?.(event);
      }
    }),
  ];
  const stop = (): void => {
    for (const stopListening of stops) {
      stopListening();
    }
    if (hasSome(held) && element.hasPointerCapture(held.pointerId)) {
      element.releasePointerCapture(held.pointerId);
    }
    held = null;
  };
  onCleanup(stop);
  return stop;
};
