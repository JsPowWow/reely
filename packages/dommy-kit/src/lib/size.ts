import { computed, onCleanup, signal } from '@reely/signals';
import type { Computed } from '@reely/signals';

/** The content box of an element, in CSS pixels. */
export interface ElementSize {
  width: number;
  height: number;
}

/**
 * The size of an element's content box through a `ResizeObserver`, which disconnects with the
 * render that created it; `0 × 0` until the first measurement.
 */
export const size = (element: Element): Computed<ElementSize> => {
  const box = signal<ElementSize>({ width: 0, height: 0 });
  const observer = new ResizeObserver(([entry]) => {
    if (entry) {
      box.value = { width: entry.contentRect.width, height: entry.contentRect.height };
    }
  });
  observer.observe(element);
  onCleanup(() => observer.disconnect());
  return computed(() => box.value);
};
