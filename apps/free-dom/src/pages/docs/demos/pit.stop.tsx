import { Await, Show, signal } from '@reely/dommy';

import css from './demos.module.css';

interface PitStop {
  stop: number;
  seconds: number;
}

/** How long the crew takes, in milliseconds of the page; the posted times are the race's own. */
export const pitStopDelay = 900;

const crewTimes = [2.4, 3.1, 2.2, 2.8];

// the crew answers a call later: with the stop time, or, on the third stop, with a failure
const callCrew = (stop: number): Promise<PitStop> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (stop === 3) {
        reject(new Error('Stop 3: a wheel nut stuck. Box again.'));
      } else {
        resolve({ stop, seconds: crewTimes[(stop - 1) % crewTimes.length] ?? 0 });
      }
    }, pitStopDelay);
  });

// `Await` shows the fallback while the crew works, then the time or the failure; a newer call drops the older one.
export const PitWall = (): Node => {
  const stop = signal(0);

  return (
    <div className={css.row}>
      <Show when={() => stop.value > 0} fallback={() => <p className={css.racing}>On track</p>}>
        {() => (
          <Await
            promise={() => callCrew(stop.value)}
            fallback={() => <p className={css.racing}>In the pits…</p>}
            catch={(error) => <p className={css.failed}>{error.message}</p>}
          >
            {(result) => (
              <p className={css.winner}>
                Stop {result.stop}: {result.seconds.toFixed(1)} s
              </p>
            )}
          </Await>
        )}
      </Show>
      <button onClick={() => (stop.value += 1)}>Box, box</button>
    </div>
  );
};
