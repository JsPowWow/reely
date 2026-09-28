import { batch, onCleanup, signal } from '@reely/dommy';
import { hasSome } from '@reely/utils';

/**
 * How much of a sector the reader has driven: the share of it above the reading line.
 *
 * @param {{ top: number; height: number }} box - The sector's box, relative to the viewport.
 * @param {number} line - The reading line, in pixels from the top of the viewport.
 * @returns {number} From 0, not reached, to 1, passed.
 */
export const sectorFill = ({ top, height }: { top: number; height: number }, line: number): number =>
  height === 0 ? Number(top <= line) : Math.min(1, Math.max(0, (line - top) / height));

/**
 * Follows the scroll through the sectors with these ids, once a frame at most, until the view
 * that calls it is taken down.
 *
 * @param {readonly string[]} ids - The ids of the sector elements, in lap order.
 * @returns {readonly (() => number)[]} Each sector's fill, from 0 to 1, as a getter to bind.
 */
export const trackLap = (ids: readonly string[]): readonly (() => number)[] => {
  const fills = ids.map(() => signal(0));
  let frame = 0;

  const measure = (): void => {
    frame = 0;
    const line = window.innerHeight / 2;
    batch(() => {
      ids.forEach((id, index) => {
        const sector = document.getElementById(id);
        const fill = fills[index];
        if (hasSome(sector) && hasSome(fill)) {
          fill.value = sectorFill(sector.getBoundingClientRect(), line);
        }
      });
    });
  };
  const schedule = (): void => {
    if (frame === 0) {
      frame = requestAnimationFrame(measure);
    }
  };

  const controller = new AbortController();
  window.addEventListener('scroll', schedule, { passive: true, signal: controller.signal });
  window.addEventListener('resize', schedule, { signal: controller.signal });
  schedule();
  onCleanup(() => {
    controller.abort();
    cancelAnimationFrame(frame);
  });

  return fills.map((fill) => () => fill.value);
};
