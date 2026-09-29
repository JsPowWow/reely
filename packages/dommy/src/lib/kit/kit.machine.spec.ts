import { effect, onCleanup } from '../../index';
import { machine } from '../../kit';

const race = (): ReturnType<typeof createRace> => createRace();
const createRace = () =>
  machine({
    initial: 'idle',
    states: {
      idle: { start: 'countdown' },
      countdown: { go: 'running', cancel: 'idle' },
      running: { finish: 'done' },
      done: { reset: 'idle' },
    },
  });

describe('machine', () => {
  it('moves only along its transitions, and says whether it moved', () => {
    const lap = race();

    const moved = [lap.send('start'), lap.send('finish'), lap.send('go')];

    expect(moved).toEqual([true, false, true]);
    expect(lap.state.value).toBe('running');
  });

  it('tells which events the current state accepts, and updates what reads it', () => {
    const lap = race();
    const canCancel: boolean[] = [];
    effect(() => {
      canCancel.push(lap.can('cancel'));
    });

    lap.send('start');
    lap.send('go');

    expect(canCancel).toEqual([false, true, false]);
  });

  it('enters and leaves a state through an effect and its cleanup', () => {
    const lap = race();
    const log: string[] = [];
    effect(() => {
      if (lap.state.value === 'countdown') {
        log.push('enter countdown');
        onCleanup(() => log.push('leave countdown'));
      }
    });

    lap.send('start');
    lap.send('cancel');

    expect(log).toEqual(['enter countdown', 'leave countdown']);
  });

  it('types its states and events from the config', () => {
    const lap = race();

    expectTypeOf(lap.state.value).toEqualTypeOf<'idle' | 'countdown' | 'running' | 'done'>();
    // @ts-expect-error `fly` is no event of this machine
    lap.send('fly');
    // @ts-expect-error a transition must lead to a state of the machine
    machine({ initial: 'idle', states: { idle: { start: 'nowhere' } } });
  });
});
