import { onCleanup } from '../reactive/owner';

/**
 * Runs `fn` once after `ms`, unless the owner it was called in goes first: the view is disposed,
 * or the effect runs again. With `ms` of 0 it runs after the render that called it is in the
 * document, which makes it the place to focus a field or measure a node.
 *
 * @param {number} ms - The delay, in milliseconds.
 * @param {VoidFunction} fn - What to run.
 * @returns {VoidFunction} Cancels the run.
 */
export const later = (ms: number, fn: VoidFunction): VoidFunction => {
  const timer = setTimeout(fn, ms);
  const cancel = (): void => {
    clearTimeout(timer);
  };
  onCleanup(cancel);
  return cancel;
};
