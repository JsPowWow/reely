import { onCleanup } from '../reactive/owner';
import { computed, signal } from '../reactive/preact-like/preact-like.signal';

import type { Computed } from '../reactive/preact-like/preact-like.signal';

/** The content box of an element, in CSS pixels. */
export interface ElementSize {
  width: number;
  height: number;
}

/**
 * The size of an element's content box, as a computed that follows it through a
 * `ResizeObserver`; the observer disconnects with the render that created it.
 *
 * @param {Element} element - The element to measure: a canvas, a board, a panel.
 * @returns {Computed<ElementSize>} Its size now; `0 × 0` until the first measurement.
 */
export const size = (element: Element): Computed<ElementSize> => {
  const box = signal<ElementSize>({ width: element.clientWidth, height: element.clientHeight });
  const observer = new ResizeObserver(([entry]) => {
    if (entry) {
      box.value = { width: entry.contentRect.width, height: entry.contentRect.height };
    }
  });
  observer.observe(element);
  onCleanup(() => observer.disconnect());
  return computed(() => box.value);
};
