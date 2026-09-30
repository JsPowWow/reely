import { onCleanup } from '@reely/signals';

/**
 * Runs `fn` once after `ms`, unless its owner is disposed first; returns the cancel. With `ms` of 0
 * it runs once the render is in the document: the place to focus a field or measure a node.
 */
export const later = (ms: number, fn: VoidFunction): VoidFunction => {
  const timer = setTimeout(fn, ms);
  const cancel = (): void => {
    clearTimeout(timer);
  };
  onCleanup(cancel);
  return cancel;
};
