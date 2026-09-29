import { isSomeFunction } from '@reely/utils';

const reducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Runs `change`, a synchronous DOM change such as a `For` reorder, and animates each child of
 * `container` that moved from its old place; nothing animates under reduced motion.
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
