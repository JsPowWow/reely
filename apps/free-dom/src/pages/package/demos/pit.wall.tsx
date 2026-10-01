import { forEachSettled, messageOf } from '@reely/basics';
import { signal } from '@reely/dommy';
import type { Signal } from '@reely/dommy';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

const lapTimes = ['1:31.204', '1:30.877', '1:30.912', '1:30.455'];

interface Screen {
  name: string;
  shows: Signal<string>;
  show: (time: string) => void;
}

const workingScreen = (name: string): Screen => {
  const shows = signal('–');
  return {
    name,
    shows,
    show: (time): void => {
      shows.value = time;
    },
  };
};

const brokenScreen = (name: string): Screen => ({
  name,
  shows: signal('offline'),
  show: (): never => {
    throw new Error(`${name} is offline`);
  },
});

// One broken screen must not keep the lap time from the
// others: `forEachSettled` calls every screen, then throws
// the error once all of them have had their turn.
export const PitWall = (): Node => {
  const screens = [
    workingScreen('Garage'),
    brokenScreen('Timing tower'),
    workingScreen('Broadcast'),
  ];
  const problem = signal('');
  let lap = 0;

  const postLap = (): void => {
    lap += 1;
    const time = `Lap ${lap}: ${lapTimes[(lap - 1) % lapTimes.length]}`;
    try {
      forEachSettled(screens, ({ show }) => show(time));
      problem.value = '';
    } catch (error) {
      problem.value = `Posted to the rest. ${messageOf(error)}.`;
    }
  };

  return (
    <div className={css.stack}>
      <ul className={own.screens}>
        {screens.map(({ name, shows }) => (
          <li>
            {name}
            <output>{shows}</output>
          </li>
        ))}
      </ul>
      <button type='button' className={css.solid} onClick={postLap}>
        Post lap time
      </button>
      <p className={css.note}>{problem}</p>
    </div>
  );
};
