# @reely/state-machine

A finite state machine for app logic. The config reads like XState's; the machine is sync by default, async on request, and runs one transition at a time. No DOM, no signals, no time of its own: you send it events.

```sh
npm i @reely/state-machine
```

## A machine

```ts
import { createStateMachine } from '@reely/state-machine';

// a pomodoro timer: 25 minutes of focus, then a break
type Phase = 'idle' | 'focus' | 'paused' | 'break';

interface TimerEvents {
  start: undefined; // no data
  pause: undefined;
  timeUp: undefined;
  setMinutes: number; // carries the length of a focus session
}

interface Pomodoro {
  state: Phase;
  events: TimerEvents;
}

const pomodoro = createStateMachine<Pomodoro>({
  initial: 'idle',
  on: { setMinutes: 'idle' }, // any-state: taken from every state that has no `setMinutes` of its own
  states: {
    idle: { on: { start: 'focus' } },
    focus: {
      on: { pause: 'paused', timeUp: { target: 'break', actions: [countSession, playChime] } },
      entry: startTimer,
      exit: stopTimer,
    },
    paused: { on: { start: 'focus' } },
    break: { on: { timeUp: 'idle' }, entry: startTimer, exit: stopTimer },
  },
});

pomodoro.send('start'); // { status: 'done', state: 'focus', change }
pomodoro.send('setMinutes', 50); // the data is required here…
pomodoro.send('timeUp'); // …and left out where the event carries none
pomodoro.can('pause'); // is there a transition for `pause` from here? never runs a selector
pomodoro.state; // 'idle'
```

One type describes a machine: its `state`, its `events`, and its `context` if it has one. The machine's types take it: `StateMachineConfig<Pomodoro>`, `StateMachineAction<Pomodoro>`, `StateMachineChange<Pomodoro>`; for the async machine, add `'async'`: `StateMachineConfig<Pomodoro, 'async'>`. A machine needs it: given to the factory, or through a config typed as `StateMachineConfig<Pomodoro>`, as in `createStateMachine(config)`.

The machine starts in `initial` without running its `entry`: creating it has no effects. `send` never throws. It answers with what happened:

| `status` | when | fields |
| --- | --- | --- |
| `done` | the transition was taken, to another state or to the same one | `state`, `change` |
| `refused` | no transition for the event here, or its selector chose none | `state`, `reason` |
| `failed` | an action, a selector or a listener threw | `state`, `error` |
| `queued` | sent from an action or a listener during a transition: it runs right after | `state` |

A ticking clock can send without checking first: `if (secondsLeft() === 0) pomodoro.send('timeUp')` is refused quietly in any state that does not expect it.

## Transitions

A transition is written in one of three forms:

```ts
on: {
  start: 'focus',                                            // the target
  timeUp: { target: 'break', actions: countSession },        // the target and actions of its own
  setMinutes: ({ event }) => (event.data > 0 ? 'idle' : undefined), // a target selector; `undefined` refuses
}
```

A transition runs `exit` of the state it leaves, its own `actions`, the state change, `entry` of the new state, then the `stateChanged` listeners. A transition to the same state runs no `exit` and no `entry`. `entry`, `exit` and `actions` take one function or an array.

Every action gets the change: `{ step, from, to, event: { type, data }, context, machine }`, where `step` is `exit`, `transition` or `entry` (listeners get `changed`). An action declared on a transition gets its event's data typed.

If an action throws before the state changes, the machine stays where it was; if it throws after (`entry`, or a listener), it keeps the new state, and the listeners still hear of it. Either way `send` answers `failed`, and the error goes to the logger.

## Context and logger

```ts
interface Timer {
  state: Phase;
  events: TimerEvents;
  context: SessionLog; // `context?: SessionLog` makes it optional in the config
}

const timer = createStateMachine<Timer>({ initial: 'idle', context: sessions, states }, { logger: console });
```

`context` is any value the machine hands to actions and selectors; a machine without one leaves it out of its type and its config. The machine writes failures to `logger.error`, and the log actions below write to it too.

## Sending from an action

An action can send the next event. It waits until the current transition has finished and runs before the outer `send` returns (run-to-completion):

```ts
break: { entry: ({ machine }) => { if (settings.skipBreaks) machine.send('timeUp'); } } // that send answers { status: 'queued' }
```

## Async machine

```ts
import { createAsyncStateMachine } from '@reely/state-machine';

interface Draft {
  state: 'editing' | 'saving' | 'saved';
  events: { save: undefined; saved: undefined };
  context: { valid(): Promise<boolean>; upload(): Promise<void> };
}

const draft = createAsyncStateMachine<Draft>({
  initial: 'editing',
  context: form,
  states: {
    editing: { on: { save: async ({ context }) => ((await context.valid()) ? 'saving' : undefined) } },
    saving: { entry: async ({ context }) => context.upload(), on: { saved: 'saved' } },
    saved: {},
  },
});

await draft.send('save'); // resolves once this transition has run
```

It awaits the selector and every action, so `entry` starts after `exit` has finished, and runs one transition at a time: a `send` made meanwhile waits for the one before. A selector here is an `async` function.

**Inside an action, send through `change.machine`.** It answers `queued` at once, and the transition runs next. An action that awaits `send` of the machine itself after another `await` waits for its own transition, which waits for the action: it never ends.

```ts
exit: async ({ machine }) => {
  await save();
  await machine.send('saved'); // fine: `change.machine` answers `queued`
  // await draft.send('saved'); — never resolves
};
```

## Helpers

`matchAction(change)` matches a change in hand; `runActionEffect()` describes the matching first and becomes an action for the config — the `pipe` and `flow` forms of one thing. Both run their functions in order and wait for a promise before the next; in an async machine, return `matchAction(change)…done` from the action so the machine awaits it, errors included. A pattern takes the event `type`, the target `to`, or both, and narrows the change for its function.

```ts
import { logAction, matchAction, runActionEffect, sequence } from '@reely/state-machine';

pomodoro.on('stateChanged', (change) =>
  matchAction(change)
    .when({ type: 'setMinutes' }, ({ event }) => showMinutes(event.data)) // `data` is a number here
    .when({ to: 'paused' }, dimClock)
);

const onIdle = runActionEffect<Pomodoro>() // `runActionEffect<Draft, 'async'>()` for the async machine
  .when({ type: 'timeUp' }, showDailyTotal) // a whole cycle is over
  .when({ type: 'setMinutes' }, ({ event }) => resetDial(event.data));

idle: { entry: sequence(logAction, onIdle) } // one action made of several; async ones are awaited in turn
```

Log actions write to the machine's logger, only where you put them:

| action | writes |
| --- | --- |
| `log` | `Leave "idle" → "focus" by "start"` |
| `logAction` | the same, with the event's data |
| `logWithContext` | the same, with the context |
| `logTransition({ data, context, level })` | what you ask for, at `log`, `info` or `warn` |

## Several machines

Machines compose as plain objects: a parent sends to a child from its actions, and hears back through the child's `stateChanged`.

```ts
const clock = createStateMachine(clockConfig); // ticking, stopped, rang
clock.on('stateChanged', ({ to }) => to === 'rang' && pomodoro.send('timeUp'));

focus: { entry: () => clock.send('start'), exit: () => clock.send('reset') }
```

## Design

- [ADR 0001](docs/adr/0001-sync-by-default-one-transition-at-a-time.md): sync by default, one transition at a time.
- [ADR 0002](docs/adr/0002-xstate-config-with-own-sugar.md): XState's config vocabulary, with our own sugar.
