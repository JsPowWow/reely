import { matchAction, runActionEffect, sequence } from './actions';
import { logAction } from './log';
import { createAsyncStateMachine, createStateMachine } from './state-machine';

import type { StateMachineChange, StateMachineConfig } from './types';

type Phase = 'ready' | 'running' | 'paused';

interface RaceEvents {
  start: number;
  pause: undefined;
  resume: undefined;
}

const race = (actions: {
  entry?: (change: StateMachineChange<Phase, RaceEvents>) => void;
}): StateMachineConfig<Phase, RaceEvents> => ({
  initial: 'ready',
  states: {
    ready: { on: { start: 'running' } },
    running: { on: { pause: 'paused' }, entry: actions.entry },
    paused: { on: { resume: 'running' }, entry: actions.entry },
  },
});

describe('matchAction', () => {
  it('calls the functions whose pattern the change matches, by event type, target, or both', () => {
    const seen: string[] = [];
    const machine = createStateMachine(
      race({
        entry: (change) =>
          matchAction(change)
            .when({ type: 'start' }, ({ event }) => {
              expectTypeOf(event.data).toEqualTypeOf<number>();
              seen.push(`start on lane ${event.data}`);
            })
            .when({ to: 'paused' }, ({ to }) => {
              expectTypeOf(to).toEqualTypeOf<'paused'>();
              seen.push(to);
            })
            .when({ type: 'resume', to: 'running' }, () => seen.push('resumed'))
            .when({ type: 'pause', to: 'running' }, () => seen.push('never')),
      })
    );

    machine.send('start', 4);
    machine.send('pause');
    machine.send('resume');

    expect(seen).toStrictEqual(['start on lane 4', 'paused', 'resumed']);
  });
});

describe('matchAction in an async machine', () => {
  it('runs its functions in order, the next after a promise settles, and hands the wait out as `done`', async () => {
    const seen: string[] = [];
    const machine = createAsyncStateMachine<Phase, RaceEvents>({
      initial: 'ready',
      states: {
        ready: { on: { start: 'running' } },
        running: {
          entry: (change) =>
            matchAction(change)
              .when({ type: 'start' }, async () => {
                await new Promise((resolve) => setTimeout(resolve));
                seen.push('uploaded');
              })
              .when({ to: 'running' }, () => seen.push('shown')).done,
        },
        paused: {},
      },
    });
    machine.on('stateChanged', () => seen.push('changed'));

    await machine.send('start', 1);

    expect(seen).toStrictEqual(['uploaded', 'shown', 'changed']);
  });

  it('lets the machine catch what a function rejects with', async () => {
    const broken = new Error('offline');
    const machine = createAsyncStateMachine<Phase, RaceEvents>({
      initial: 'ready',
      states: {
        ready: { on: { start: 'running' } },
        running: { entry: (change) => matchAction(change).when({ type: 'start' }, () => Promise.reject(broken)).done },
        paused: {},
      },
    });

    expect(await machine.send('start', 1)).toMatchObject({ status: 'failed', state: 'running', error: broken });
  });
});

describe('runActionEffect', () => {
  it('describes the matching first and takes the change later, as an action', () => {
    const seen: string[] = [];
    const onEntry = runActionEffect<Phase, RaceEvents>()
      .when({ type: 'start' }, ({ event }) => seen.push(`lane ${event.data}`))
      .when({ to: 'paused' }, ({ to }) => seen.push(to));
    const machine = createStateMachine(race({ entry: onEntry }));

    machine.send('start', 2);
    machine.send('pause');

    expect(seen).toStrictEqual(['lane 2', 'paused']);
  });

  it('keeps each step of the description its own: adding a rule never changes an effect made before', () => {
    const seen: string[] = [];
    const onStart = runActionEffect<Phase, RaceEvents>().when({ type: 'start' }, () => seen.push('start'));
    const onBoth = onStart.when({ to: 'paused' }, () => seen.push('paused'));
    const machine = createStateMachine(race({ entry: onStart }));

    machine.send('start', 1);
    machine.send('pause');

    expect(seen).toStrictEqual(['start']);
    expect(onBoth).not.toBe(onStart);
  });

  it('waits for an async function before the next one, in an async machine', async () => {
    const seen: string[] = [];
    const machine = createAsyncStateMachine<Phase, RaceEvents>({
      initial: 'ready',
      states: {
        ready: { on: { start: 'running' } },
        running: {
          entry: runActionEffect<Phase, RaceEvents, undefined, 'async'>()
            .when({ type: 'start' }, async () => {
              await new Promise((resolve) => setTimeout(resolve));
              seen.push('first');
            })
            .when({ to: 'running' }, () => seen.push('second')),
        },
        paused: {},
      },
    });

    await machine.send('start', 1);

    expect(seen).toStrictEqual(['first', 'second']);
  });
});

describe('sequence', () => {
  it('joins log actions and effects in a config, as the README shows', () => {
    const seen: string[] = [];
    const onEntry = runActionEffect<Phase, RaceEvents>().when({ to: 'running' }, () => seen.push('running'));
    const machine = createStateMachine(race({ entry: sequence(logAction, onEntry) }), {
      logger: { log: (line) => seen.push(String(line)), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    });

    machine.send('start', 1);

    expect(seen).toStrictEqual(['Enter "ready" → "running" by "start" with 1', 'running']);
  });

  it('makes one action of several, run in order, the async ones awaited', async () => {
    const seen: string[] = [];
    const later = async (): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve));
      seen.push('saved');
    };
    const both = sequence(later, () => seen.push('shown'));

    await both(undefined);

    expect(seen).toStrictEqual(['saved', 'shown']);
  });

  it('stops at the first action that throws', () => {
    const shown = vi.fn();
    const both = sequence(() => {
      throw new Error('broken');
    }, shown);

    expect(() => both(undefined)).toThrow('broken');
    expect(shown).not.toHaveBeenCalled();
  });
});
