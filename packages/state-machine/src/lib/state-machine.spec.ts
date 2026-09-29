import { createAsyncStateMachine, createStateMachine } from './state-machine';

import type { IStateMachine, StateMachineConfig, StateMachineMode, StateMachineTypes } from './types';

type Phase = 'ready' | 'counting' | 'running' | 'paused';

interface FinalEvents {
  play: undefined;
  countdownDone: undefined;
  ended: undefined;
  selectStage: number;
}

interface Final {
  state: Phase;
  events: FinalEvents;
}

const finalOf = <Mode extends StateMachineMode>(): StateMachineConfig<Final, Mode> => ({
  initial: 'ready',
  on: { selectStage: 'ready' },
  states: {
    ready: { on: { play: 'counting' } },
    counting: { on: { countdownDone: 'running' } },
    running: { on: { play: 'paused', ended: 'ready' } },
    paused: { on: { play: 'running', selectStage: 'paused' } },
  },
});

const final = finalOf<'sync'>();

describe('createStateMachine', () => {
  it('starts in the initial state and moves to the target of an event, inside `send`', () => {
    const machine = createStateMachine(final);

    const result = machine.send('play');

    expect(machine.state).toBe('counting');
    expect(result).toMatchObject({
      status: 'done',
      state: 'counting',
      change: { step: 'changed', from: 'ready', to: 'counting', event: { type: 'play', data: undefined } },
    });
  });

  it('starts in the initial state without running its `entry`', () => {
    const entered = vi.fn();

    const machine = createStateMachine<Final>({
      ...final,
      states: { ...final.states, ready: { on: { play: 'counting' }, entry: entered } },
    });

    expect(machine.state).toBe('ready');
    expect(entered).not.toHaveBeenCalled();
  });

  it('gives one event a meaning by state', () => {
    const machine = createStateMachine(final);

    const states = ['play', 'countdownDone', 'play', 'play'].map((type) => {
      machine.send(type as 'play');
      return machine.state;
    });

    expect(states).toStrictEqual(['counting', 'running', 'paused', 'running']);
  });

  it('refuses an event the current state has no transition for, quietly', () => {
    const machine = createStateMachine(final);
    const changed = vi.fn();
    machine.on('stateChanged', changed);

    const result = machine.send('countdownDone');

    expect(result).toMatchObject({ status: 'refused', state: 'ready' });
    expect(machine.state).toBe('ready');
    expect(changed).not.toHaveBeenCalled();
  });

  it('takes an any-state transition from every state, unless the state declares its own', () => {
    const machine = createStateMachine(final);
    machine.send('play');
    machine.send('countdownDone');

    machine.send('selectStage', 2);
    expect(machine.state).toBe('ready');

    machine.send('play');
    machine.send('countdownDone');
    machine.send('play');
    const result = machine.send('selectStage', 3);
    expect(result).toMatchObject({
      status: 'done',
      state: 'paused',
      change: { event: { type: 'selectStage', data: 3 } },
    });
  });

  it('says whether an event has a transition from the current state', () => {
    const machine = createStateMachine(final);

    expect([machine.can('play'), machine.can('countdownDone'), machine.can('selectStage')]).toStrictEqual([
      true,
      false,
      true,
    ]);
  });

  describe('a transition', () => {
    type Door = 'closed' | 'open' | 'locked';
    interface DoorEvents {
      open: undefined;
      close: undefined;
      lock: string;
      knock: undefined;
    }
    interface DoorMachine {
      state: Door;
      events: DoorEvents;
    }

    it("runs exit, the transition's actions, the state change, entry, then `stateChanged`", () => {
      const steps: string[] = [];
      const note = (name: string) => (change: { step: string; machine: { state: Door } }) =>
        steps.push(`${name}:${change.step}:${change.machine.state}`);
      const machine = createStateMachine<DoorMachine>({
        initial: 'closed',
        states: {
          closed: { on: { open: { target: 'open', actions: [note('first'), note('second')] } }, exit: note('exit') },
          open: { entry: note('entry') },
          locked: {},
        },
      });
      machine.on('stateChanged', note('listener'));

      machine.send('open');

      expect(steps).toStrictEqual([
        'exit:exit:closed',
        'first:transition:closed',
        'second:transition:closed',
        'entry:entry:open',
        'listener:changed:open',
      ]);
    });

    it('runs no exit and no entry on a transition to the state it leaves', () => {
      const steps: string[] = [];
      const machine = createStateMachine<DoorMachine>({
        initial: 'closed',
        states: {
          closed: {
            on: { knock: { target: 'closed', actions: () => steps.push('knock') } },
            entry: () => steps.push('entry'),
            exit: () => steps.push('exit'),
          },
          open: {},
          locked: {},
        },
      });

      const result = machine.send('knock');

      expect(steps).toStrictEqual(['knock']);
      expect(result).toMatchObject({ status: 'done', change: { from: 'closed', to: 'closed' } });
    });

    it('hands actions the event with its data, typed by the event', () => {
      const keys: string[] = [];
      const machine = createStateMachine<DoorMachine>({
        initial: 'closed',
        states: {
          closed: {
            on: {
              lock: {
                target: 'locked',
                actions: ({ event }) => {
                  expectTypeOf(event.data).toEqualTypeOf<string>();
                  keys.push(event.data);
                },
              },
            },
          },
          open: {},
          locked: {
            entry: ({ event }) => {
              if (event.type === 'lock') {
                expectTypeOf(event.data).toEqualTypeOf<string>();
                keys.push(`entered with ${event.data}`);
              }
            },
          },
        },
      });

      machine.send('lock', 'brass key');

      expect(keys).toStrictEqual(['brass key', 'entered with brass key']);
    });

    it('lets a target selector pick the state, or refuse with `undefined`', () => {
      const machine = createStateMachine<DoorMachine>({
        initial: 'closed',
        states: {
          closed: {
            on: { lock: ({ event }) => (event.data === 'brass key' ? 'locked' : undefined), open: 'open' },
          },
          open: { on: { close: ({ from }) => (from === 'open' ? 'closed' : undefined) } },
          locked: {},
        },
      });

      expect(machine.send('lock', 'wrong key')).toMatchObject({ status: 'refused', state: 'closed' });
      expect(machine.send('lock', 'brass key')).toMatchObject({ status: 'done', state: 'locked' });
    });

    it('fails when a selector picks a state the machine does not have', () => {
      const machine = createStateMachine<DoorMachine>({
        initial: 'closed',
        states: { closed: { on: { knock: () => 'cellar' as Door } }, open: {}, locked: {} },
      });

      expect(machine.send('knock')).toMatchObject({
        status: 'failed',
        state: 'closed',
        error: { message: expect.stringContaining('cellar') },
      });
    });
  });
});

describe('a `send` from an action or a listener', () => {
  it('runs after the current transition and before the outer `send` returns, answering `queued`', () => {
    const steps: string[] = [];
    let inner: unknown;
    const machine = createStateMachine<Final>({
      ...final,
      states: {
        ...final.states,
        counting: {
          on: { countdownDone: 'running' },
          entry: ({ machine }) => {
            inner = machine.send('countdownDone');
            steps.push(`entry sent, still ${machine.state}`);
          },
        },
      },
    });
    machine.on('stateChanged', ({ to }) => steps.push(`changed to ${to}`));

    const outer = machine.send('play');

    expect(inner).toStrictEqual({ status: 'queued', state: 'counting' });
    expect(outer).toMatchObject({ status: 'done', state: 'counting' });
    expect(machine.state).toBe('running');
    expect(steps).toStrictEqual(['entry sent, still counting', 'changed to counting', 'changed to running']);
  });

  it('answers `queued` the same when the action reaches the machine through its own variable', () => {
    let inner: unknown;
    const machine = createStateMachine<Final>({
      ...final,
      states: {
        ...final.states,
        counting: {
          on: { countdownDone: 'running' },
          entry: () => {
            inner = machine.send('countdownDone');
          },
        },
      },
    });

    machine.send('play');

    expect(inner).toStrictEqual({ status: 'queued', state: 'counting' });
    expect(machine.state).toBe('running');
  });
});

describe('a throwing action or listener', () => {
  type Light = 'off' | 'on';
  interface LightEvents {
    toggle: undefined;
  }
  interface LightMachine {
    state: Light;
    events: LightEvents;
  }
  const broken = new Error('broken bulb');
  const light = (states: StateMachineConfig<LightMachine>['states']): StateMachineConfig<LightMachine> => ({
    initial: 'off',
    states,
  });

  it("keeps the old state when `exit` or the transition's actions throw, and runs nothing after", () => {
    const entered = vi.fn();
    const heard = vi.fn();
    const machine = createStateMachine(
      light({
        off: {
          on: { toggle: { target: 'on', actions: entered } },
          exit: () => {
            throw broken;
          },
        },
        on: { entry: entered },
      })
    );
    machine.on('stateChanged', heard);

    const result = machine.send('toggle');

    expect(result).toStrictEqual({ status: 'failed', state: 'off', error: broken });
    expect(machine.state).toBe('off');
    expect([entered, heard].map((spy) => spy.mock.calls.length)).toStrictEqual([0, 0]);
  });

  it('keeps the new state when `entry` throws, and still tells the listeners', () => {
    const heard = vi.fn();
    const machine = createStateMachine(
      light({
        off: { on: { toggle: 'on' } },
        on: {
          entry: () => {
            throw broken;
          },
        },
      })
    );
    machine.on('stateChanged', heard);

    const result = machine.send('toggle');

    expect(result).toStrictEqual({ status: 'failed', state: 'on', error: broken });
    expect(heard).toHaveBeenCalledOnce();
  });

  it('calls every listener when one throws, and reports every error', () => {
    const later = vi.fn();
    const machine = createStateMachine(
      light({
        off: { on: { toggle: 'on' } },
        on: {
          entry: () => {
            throw broken;
          },
        },
      })
    );
    const deaf = new Error('deaf listener');
    machine.on('stateChanged', () => {
      throw deaf;
    });
    machine.on('stateChanged', later);

    const result = machine.send('toggle');

    expect(later).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ status: 'failed', state: 'on', error: { errors: [broken, deaf] } });
  });

  it('logs a failure to the logger it was given', () => {
    const logger = { log: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const machine = createStateMachine(
      light({
        off: {
          on: {
            toggle: () => {
              throw broken;
            },
          },
        },
        on: {},
      }),
      { logger }
    );

    machine.send('toggle');

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('toggle'), broken);
  });
});

interface Extended extends StateMachineTypes {
  state: 'idle';
  events: object;
}

// never run: the compiler checks these calls
export function misuses(machine: IStateMachine<Final>): void {
  // @ts-expect-error `selectStage` carries a stage number
  machine.send('selectStage');
  // @ts-expect-error `play` carries nothing
  machine.send('play', 1);
  // @ts-expect-error no such event
  machine.send('jump');
  // @ts-expect-error no such state
  createStateMachine<Final>({ initial: 'cellar', states: final.states });
  const idle = { idle: {} };
  // @ts-expect-error the types declare a context the config leaves out
  createStateMachine<{ state: 'idle'; events: object; context: number }>({ initial: 'idle', states: idle });
  createStateMachine<{ state: 'idle'; events: object; context?: number }>({ initial: 'idle', states: idle });
  const count: number = createStateMachine<{ state: 'idle'; events: object; context: number }>({
    initial: 'idle',
    context: 0,
    states: idle,
  }).context;
  const maybe: number | undefined = createStateMachine<{ state: 'idle'; events: object; context?: number }>({
    initial: 'idle',
    states: idle,
  }).context;
  const none: undefined = machine.context;
  const extended: undefined = createStateMachine<Extended>({ initial: 'idle', states: idle }).context;
  const inferred: Phase = createStateMachine(final).state;
  void [count, maybe, none, extended, inferred];
  // @ts-expect-error a config typed nowhere: the machine needs its types
  createStateMachine({ initial: 'cellar', states: idle });
}

describe('a config that is not what its types say', () => {
  it('fails a transition whose actions hold something other than functions', () => {
    const machine = createStateMachine<Final>({
      ...final,
      states: { ...final.states, ready: { on: { play: { target: 'counting', actions: ['typo'] as never } } } },
    });

    expect(machine.send('play')).toMatchObject({ status: 'failed', state: 'ready', error: expect.any(TypeError) });
  });

  it('knows no events named like the members of `Object.prototype`', () => {
    const machine = createStateMachine(final);

    expect(machine.can('toString' as 'play')).toBe(false);
    expect(machine.send('constructor' as 'play')).toMatchObject({ status: 'refused', state: 'ready' });
  });

  it('refuses at creation an initial state it does not have', () => {
    expect(() => createStateMachine({ ...final, initial: 'cellar' as Phase })).toThrow(TypeError);
  });

  it('logs the error of a promise an action returned to a sync machine', async () => {
    const broken = new Error('late');
    const logger = { log: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const machine = createStateMachine<Final>(
      {
        ...final,
        states: { ...final.states, ready: { on: { play: 'counting' }, exit: () => Promise.reject(broken) } },
      },
      { logger }
    );

    machine.send('play');
    await Promise.resolve();

    expect(logger.error).toHaveBeenCalledWith(expect.any(String), broken);
  });
});

describe('a `send` from a listener', () => {
  it('answers `queued` in both machines, and runs next', async () => {
    const answers: unknown[] = [];
    const sync = createStateMachine(final);
    const async = createAsyncStateMachine(finalOf<'async'>());
    for (const machine of [sync, async]) {
      const stop = machine.on('stateChanged', ({ to }) => {
        if (to === 'counting') {
          stop();
          answers.push(machine.send('countdownDone'));
        }
      });
    }

    sync.send('play');
    await async.send('play');
    await Promise.resolve();

    expect(await Promise.all(answers)).toStrictEqual([
      { status: 'queued', state: 'counting' },
      { status: 'queued', state: 'counting' },
    ]);
    expect([sync.state, async.state]).toStrictEqual(['running', 'running']);
  });

  it('gives `change.machine` the real result once the transition is over, in both machines', async () => {
    const sync = createStateMachine(final).send('play');
    const async = await createAsyncStateMachine(finalOf<'async'>()).send('play');

    if (sync.status !== 'done' || async.status !== 'done') {
      throw new Error('expected both transitions done');
    }
    expect(sync.change.machine.send('countdownDone')).toMatchObject({ status: 'done', state: 'running' });
    expect(await async.change.machine.send('countdownDone')).toMatchObject({ status: 'done', state: 'running' });
  });
});
