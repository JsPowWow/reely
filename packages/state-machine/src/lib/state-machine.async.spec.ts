import { createAsyncStateMachine, createStateMachine } from './state-machine';

type Draft = 'editing' | 'saving' | 'saved';

interface DraftEvents {
  save: undefined;
  saved: undefined;
  edit: string;
}

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('createAsyncStateMachine', () => {
  it('awaits the selector and every action in order, and resolves `send` with the result', async () => {
    const steps: string[] = [];
    const machine = createAsyncStateMachine<Draft, DraftEvents>({
      initial: 'editing',
      states: {
        editing: {
          on: {
            save: async () => {
              await tick();
              steps.push('selector');
              return 'saving';
            },
          },
          exit: async () => {
            await tick();
            steps.push('exit');
          },
        },
        saving: { entry: () => void steps.push('entry') },
        saved: {},
      },
    });

    const pending = machine.send('save');
    expect(machine.state).toBe('editing');

    expect(await pending).toMatchObject({ status: 'done', state: 'saving' });
    expect(steps).toStrictEqual(['selector', 'exit', 'entry']);
  });

  it('runs one transition at a time: the next sees the state the one before left', async () => {
    const machine = createAsyncStateMachine<Draft, DraftEvents>({
      initial: 'editing',
      states: {
        editing: {
          on: {
            save: async () => {
              await tick();
              return 'saving';
            },
          },
        },
        saving: { on: { saved: 'saved' } },
        saved: {},
      },
    });

    const results = await Promise.all([machine.send('save'), machine.send('saved')]);

    expect(results.map(({ status, state }) => `${status} ${String(state)}`)).toStrictEqual([
      'done saving',
      'done saved',
    ]);
  });

  it('never waits for itself: an action awaiting a `send` gets `queued`, and the transition runs next', async () => {
    const answers: unknown[] = [];
    const machine = createAsyncStateMachine<Draft, DraftEvents>({
      initial: 'editing',
      states: {
        editing: { on: { save: 'saving' } },
        saving: {
          on: { saved: 'saved' },
          entry: async (change) => {
            answers.push(await machine.send('saved'));
            await tick();
            answers.push(await change.machine.send('edit', 'late'));
          },
        },
        saved: { on: { edit: 'editing' } },
      },
    });

    expect(await machine.send('save')).toMatchObject({ status: 'done', state: 'saving' });
    await tick();

    expect(answers).toStrictEqual([
      { status: 'queued', state: 'saving' },
      { status: 'queued', state: 'saving' },
    ]);
    expect(machine.state).toBe('editing');
  });

  it('fails a transition whose selector rejects, keeping the state', async () => {
    const broken = new Error('offline');
    const machine = createAsyncStateMachine<Draft, DraftEvents>({
      initial: 'editing',
      states: { editing: { on: { save: () => Promise.reject(broken) } }, saving: {}, saved: {} },
    });

    expect(await machine.send('save')).toStrictEqual({ status: 'failed', state: 'editing', error: broken });
  });

  it('answers `can` at once', () => {
    const machine = createAsyncStateMachine<Draft, DraftEvents>({
      initial: 'editing',
      states: { editing: { on: { save: 'saving' } }, saving: {}, saved: {} },
    });

    expect([machine.can('save'), machine.can('saved')]).toStrictEqual([true, false]);
  });
});

describe('createStateMachine given a promise', () => {
  it('fails the transition instead of running on before the promise settles', () => {
    const entered = vi.fn();
    const machine = createStateMachine<Draft, DraftEvents>({
      initial: 'editing',
      states: {
        editing: { on: { save: 'saving' }, exit: async () => tick() },
        saving: { entry: entered },
        saved: {},
      },
    });

    const result = machine.send('save');

    expect(result).toMatchObject({ status: 'failed', state: 'editing', error: expect.any(TypeError) });
    expect(entered).not.toHaveBeenCalled();
  });
});
