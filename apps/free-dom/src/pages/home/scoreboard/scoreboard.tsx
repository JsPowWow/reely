import { isSomeFunction } from '@reely/basics';
import { computed, effect, For, onCleanup, signal } from '@reely/dommy';
import type { Signal } from '@reely/dommy';
import { listen } from '@reely/dommy-kit';

import { FlapText } from './flap.text';
import { advance, formatGap, standingsOf, startRace } from './race';
import { scoreboardText } from './scoreboard.text';
import { unflashed } from '../../../demo/mutation.meter';

import css from './scoreboard.module.css';

import type { Car } from './race';

const tickMs = 1500;
// a race ends before its time outgrows the seven tiles it is shown on
const raceSeconds = 600;

const pageShownNow = (): boolean => document.visibilityState !== 'hidden';

/** Keeps `shown` telling whether the element is on screen until its render is disposed; on, where unknown. */
const followOnScreen =
  (shown: Signal<boolean>) =>
  (element: Element): void => {
    if (!isSomeFunction(window.IntersectionObserver)) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      shown.value = entry?.isIntersecting ?? true;
    });
    observer.observe(element);
    onCleanup(() => observer.disconnect());
  };

/**
 * A split-flap board of a simulated race: rows stay in their places and their words turn when a car
 * passes another. The race runs while the page is in view and its reader has not paused it.
 */
export const Scoreboard = ({ cars, seed }: { cars: readonly Car[]; seed: number }): Node => {
  const race = signal(startRace(cars, seed));
  const rows = computed(() => standingsOf(race.value).map((standing, place) => ({ place, standing })));
  const paused = signal(false);
  const pageShown = signal(pageShownNow());
  const boardShown = signal(true);
  listen(document, 'visibilitychange', () => {
    pageShown.value = pageShownNow();
  });

  const board = (
    <div
      className={css.board}
      elementRef={followOnScreen(boardShown)}
      {...unflashed}
      aria={{ role: 'table', ariaLabel: () => scoreboardText().label }}
    >
      <div className={`${css.row} ${css.head}`} aria={{ role: 'row' }}>
        <span aria={{ role: 'columnheader' }}>{() => scoreboardText().columns.place}</span>
        <span aria={{ role: 'columnheader' }}>{() => scoreboardText().columns.car}</span>
        <span className={css.end} aria={{ role: 'columnheader' }}>
          {() => scoreboardText().columns.time}
        </span>
      </div>
      <For each={rows} by={(row) => row.place}>
        {(row) => (
          <div className={css.row} aria={{ role: 'row' }}>
            <span className={css.place} aria={{ role: 'cell' }}>
              {String(row().place + 1)}
            </span>
            <span className={css.car} aria={{ role: 'cell' }}>
              <span className={css.dot} styles={{ '--dot': () => row().standing.car.color }} />
              <FlapText text={() => row().standing.car.name} width={7} />
            </span>
            <span className={css.end} aria={{ role: 'cell' }}>
              <FlapText text={() => formatGap(row().standing.gap, race.value.elapsed)} width={7} align='end' />
            </span>
          </div>
        )}
      </For>
    </div>
  );
  effect(() => {
    if (paused.value || !pageShown.value || !boardShown.value) {
      return;
    }
    const timer = setInterval(() => {
      const next = advance(race.value, tickMs / 1000);
      race.value = next.elapsed < raceSeconds ? next : startRace(cars, next.seed + 1);
    }, tickMs);
    onCleanup(() => clearInterval(timer));
  });

  return (
    <div className={css.scoreboard}>
      <div className={css.bar}>
        <h2 className={css.title}>{() => scoreboardText().title}</h2>
        <button type='button' className={css.pause} onClick={() => (paused.value = !paused.value)}>
          {() => (paused.value ? scoreboardText().resume : scoreboardText().pause)}
        </button>
      </div>
      {board}
    </div>
  );
};
