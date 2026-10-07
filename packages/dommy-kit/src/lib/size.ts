import { computed, onCleanup, signal } from '@reely/signals';
import type { Computed } from '@reely/signals';

/** The content box of an element, in CSS pixels. */
export interface ElementSize {
  width: number;
  height: number;
}

// the content box as the observer reports it: inside the padding; an element out of the document
// has no computed padding
const measure = (element: Element): ElementSize => {
  const style = getComputedStyle(element);
  const padding = (side: 'top' | 'right' | 'bottom' | 'left'): number =>
    Number.parseFloat(style.getPropertyValue(`padding-${side}`)) || 0;
  return {
    width: Math.max(0, element.clientWidth - padding('left') - padding('right')),
    height: Math.max(0, element.clientHeight - padding('top') - padding('bottom')),
  };
};

/**
 * The size of an element's content box through a `ResizeObserver`, which disconnects with the
 * render that created it. It is measured at once, or, for an element a render has yet to insert,
 * once the render is in, so a canvas drawn in the first frame has its size; `0 × 0` while the
 * element is not laid out.
 */
export const size = (element: Element): Computed<ElementSize> => {
  const box = signal(measure(element));
  let reported = false;
  const observer = new ResizeObserver(([entry]) => {
    if (entry) {
      reported = true;
      box.value = { width: entry.contentRect.width, height: entry.contentRect.height };
    }
  });
  observer.observe(element);
  onCleanup(() => observer.disconnect());
  if (!element.isConnected) {
    queueMicrotask(() => {
      if (!reported) {
        box.value = measure(element);
      }
    });
  }
  return computed(() => box.value);
};
