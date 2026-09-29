import { createAsyncStateMachine, createStateMachine, logAction, matchAction } from '@reely/state-machine';
import type { StateMachineConfig, StateMachineResult } from '@reely/state-machine';

type Phase = 'ready' | 'counting' | 'running';

interface FinalEvents {
  play: undefined;
  go: undefined;
  selectStage: number;
}

const lines: string[] = [];
const logger = {
  log: (line: unknown) => void lines.push(String(line)),
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

const config: StateMachineConfig<Phase, FinalEvents> = {
  initial: 'ready',
  on: { selectStage: { target: 'ready', actions: logAction } },
  states: {
    ready: { on: { play: 'counting' } },
    counting: { on: { go: 'running' }, entry: ({ machine }) => void machine.send('go') },
    running: {},
  },
};

const final = createStateMachine(config, { logger });
const stages: number[] = [];
final.on('stateChanged', (change) =>
  matchAction(change).when({ type: 'selectStage' }, ({ event }) => stages.push(event.data))
);

const played: StateMachineResult<Phase, FinalEvents> = final.send('play');
const selected = final.send('selectStage', 3);

const draft = createAsyncStateMachine<'editing' | 'saved', { save: undefined }>({
  initial: 'editing',
  states: { editing: { on: { save: async () => 'saved' } }, saved: {} },
});
const saved = await draft.send('save');

if (
  played.status !== 'done' ||
  final.state !== 'ready' ||
  selected.status !== 'done' ||
  stages.join() !== '3' ||
  lines.join() !== 'Transition "running" → "ready" by "selectStage" with 3' ||
  saved.state !== 'saved'
) {
  throw new Error(`unexpected machine: ${JSON.stringify({ played, selected, stages, lines, saved })}`);
}
