import { onCleanup, signal } from '@reely/dommy';
import { createStateMachine } from '@reely/state-machine';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

type Phase = 'grid' | 'lights' | 'out' | 'away' | 'jumped';

interface Start {
  state: Phase;
  events: {
    arm: undefined;
    light: undefined;
    out: undefined;
    launch: undefined;
    reset: undefined;
  };
}

// lights go out after a hold the driver cannot guess
const holds = [1400, 600, 2200, 1000];

// The buttons send without checking the state: a launch on
// the grid is refused, one under the lights is a jump start,
// and only one after they go out is timed.
export const StartLights = (): Node => {
  const phase = signal<Phase>('grid');
  const lit = signal(0);
  const reaction = signal(0);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const stopTimers = (): void => {
    timers.forEach(clearTimeout);
    timers.clear();
  };
  onCleanup(stopTimers);
  let starts = 0;
  let outAt = 0;
  const lightsOff = (): void => {
    lit.value = 0;
  };

  const start = createStateMachine<Start>({
    initial: 'grid',
    on: {
      reset: {
        target: 'grid',
        actions: [stopTimers, lightsOff],
      },
    },
    states: {
      grid: { on: { arm: 'lights' } },
      lights: {
        entry: ({ machine }) => {
          const hold = holds[starts % holds.length] ?? 0;
          starts += 1;
          for (let light = 1; light <= 5; light++) {
            timers.add(setTimeout(() => machine.send('light'), light * 1000));
          }
          timers.add(setTimeout(() => machine.send('out'), 5000 + hold));
        },
        on: {
          light: { target: 'lights', actions: () => (lit.value += 1) },
          out: 'out',
          launch: { target: 'jumped', actions: stopTimers },
        },
      },
      out: {
        entry: () => {
          lightsOff();
          outAt = Date.now();
        },
        on: {
          launch: {
            target: 'away',
            actions: () => (reaction.value = Date.now() - outAt),
          },
        },
      },
      away: {},
      jumped: {},
    },
  });
  start.on('stateChanged', ({ to }) => (phase.value = to));

  const calls: Record<Phase, () => string> = {
    grid: () => 'Arm the lights, launch when they go out',
    lights: () => 'Hold it…',
    out: () => 'Go!',
    away: () => `Away in ${(reaction.value / 1000).toFixed(3)} s`,
    jumped: () => 'Jump start: a drive-through penalty',
  };

  return (
    <div className={css.stack}>
      <div className={own.lights}>
        {[1, 2, 3, 4, 5].map((light) => (
          <span data-lit={() => String(lit.value >= light)} />
        ))}
      </div>
      <p className={css.badge}>{() => calls[phase.value]()}</p>
      <div className={css.row}>
        <button type='button' onClick={() => start.send('arm')}>
          Arm the lights
        </button>
        <button
          type='button'
          className={css.solid}
          onClick={() => start.send('launch')}
        >
          Launch
        </button>
        <button type='button' onClick={() => start.send('reset')}>
          Reset
        </button>
      </div>
    </div>
  );
};
