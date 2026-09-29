import { isSomeFunction } from '@reely/utils';

const reducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Makes a reorder visible: measures the children of `container`, runs `change` (a signal write
 * that makes `For` move rows, for one), then animates each child that moved from where it was
 * to where it is. New children and children that stayed do not move; under reduced motion
 * nothing does.
 *
 * @param {Element} container - The parent of the rows.
 * @param {VoidFunction} change - Changes the DOM synchronously.
 * @param {KeyframeAnimationOptions} [options] - The animation timing; 250 ms ease-out by default.
 * @returns {void}
 */
export const flip = (
  container: Element,
  change: VoidFunction,
  options: KeyframeAnimationOptions = { duration: 250, easing: 'ease-out' }
): void => {
  const before = new Map(Array.from(container.children, (child) => [child, child.getBoundingClientRect()]));
  change();
  if (reducedMotion()) {
    return;
  }
  for (const child of Array.from(container.children)) {
    const from = before.get(child);
    const to = child.getBoundingClientRect();
    const [dx, dy] = from ? [from.left - to.left, from.top - to.top] : [0, 0];
    if (dx !== 0 || dy !== 0) {
      child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], options);
    }
  }
};
