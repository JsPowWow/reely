import { log, logAction, logTransition, logWithContext } from './log';
import { createStateMachine } from './state-machine';

import type { Mock } from 'vitest';

type Phase = 'ready' | 'running';

interface RaceEvents {
  start: { lane: number };
  stop: undefined;
}

interface Race {
  state: Phase;
  events: RaceEvents;
}

type Write = Mock<(...data: unknown[]) => void>;

const logger = (): Record<'log' | 'info' | 'warn' | 'error', Write> => ({
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

describe('log actions', () => {
  it('log where they are put, the step, states and event, with data or context when asked', () => {
    const out = logger();
    const machine = createStateMachine<Race & { context: { track: string } }>(
      {
        initial: 'ready',
        context: { track: 'Monza' },
        states: {
          ready: { on: { start: { target: 'running', actions: logAction } }, exit: log },
          running: { on: { stop: 'ready' }, entry: logWithContext },
        },
      },
      { logger: out }
    );

    machine.send('start', { lane: 3 });
    machine.send('stop');

    expect(out.log.mock.calls.map(([line]) => line)).toStrictEqual([
      'Leave "ready" → "running" by "start"',
      'Transition "ready" → "running" by "start" with {"lane":3}',
      'Enter "ready" → "running" by "start" in {"track":"Monza"}',
    ]);
  });

  it('write at the level asked, and nowhere without a logger', () => {
    const out = logger();
    const quiet = logTransition({ level: 'info' });
    const config = {
      initial: 'ready',
      states: { ready: { on: { start: 'running' }, exit: quiet }, running: {} },
    } as const;

    createStateMachine<Race>(config, { logger: out }).send('start', { lane: 1 });
    createStateMachine<Race>(config).send('start', { lane: 1 });

    expect(out.info).toHaveBeenCalledExactlyOnceWith('Leave "ready" → "running" by "start"');
    expect(out.log).not.toHaveBeenCalled();
  });

  it('never fail a transition over data they cannot print', () => {
    const out = logger();
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;
    const machine = createStateMachine<Race & { context: { self?: unknown } }>(
      {
        initial: 'ready',
        context: cyclic,
        states: { ready: { on: { start: { target: 'running', actions: logWithContext } } }, running: {} },
      },
      { logger: out }
    );

    expect(machine.send('start', { lane: 1 })).toMatchObject({ status: 'done', state: 'running' });
    expect(out.log).toHaveBeenCalledOnce();
  });
});
