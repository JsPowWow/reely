import type { EventArguments, EventsMap, EventType, Listener, Unsubscribe } from '@reely/emitter';

/** The name of a state. */
export type StateMachineState = PropertyKey;

/** `sync` runs a transition inside `send`; `async` awaits target selectors and actions, one transition at a time. */
export type StateMachineMode = 'sync' | 'async';

/** Where the machine and its log actions write; `console` fits. */
export interface StateMachineLogger {
  log(...data: unknown[]): void;
  info(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
}

/** An event as actions see it: its type and, where the type declares it, its data. */
export type StateMachineEvent<Events extends EventsMap, Type extends EventType<Events> = EventType<Events>> = {
  [T in Type]: { readonly type: T; readonly data: Events[T] };
}[Type];

/** The step of a transition an action runs at; listeners of `stateChanged` get `changed`. */
export type StateMachineStep = 'exit' | 'transition' | 'entry' | 'changed';

/** What an action and a listener get about one transition. */
export interface StateMachineChange<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<Events> = EventType<Events>
> {
  readonly step: StateMachineStep;
  readonly from: State;
  readonly to: State;
  readonly event: StateMachineEvent<Events, Type>;
  readonly context: Context;
  /** The machine; `send` from it answers `queued` and runs its transition right after this one. */
  readonly machine: IStateMachine<State, Events, Context, Mode>;
}

/** What a target selector gets: the change before its target is known. */
export type StateMachineSelection<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<Events> = EventType<Events>
> = Omit<StateMachineChange<State, Events, Context, Mode, Type>, 'step' | 'to'>;

type Returned<Mode extends StateMachineMode, T> = Mode extends 'async' ? T | PromiseLike<T> : T;

// an async selector returns only a promise: TypeScript widens the state an async function returns where a plain value may come back too
type Selected<Mode extends StateMachineMode, T> = Mode extends 'async' ? PromiseLike<T> : T;

/** A function the machine runs at a step of a transition; the async machine awaits what it returns. */
export type StateMachineAction<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<Events> = EventType<Events>
> = (change: StateMachineChange<State, Events, Context, Mode, Type>) => Returned<Mode, void>;

/** One action, or several run in order. */
export type StateMachineActions<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<Events> = EventType<Events>
> =
  | StateMachineAction<State, Events, Context, Mode, Type>
  | readonly StateMachineAction<State, Events, Context, Mode, Type>[];

/** The target of a transition: a state, a state with actions, or a selector that picks one (`undefined` refuses). */
export type StateMachineTransition<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<Events> = EventType<Events>
> =
  | State
  | { readonly target: State; readonly actions?: StateMachineActions<State, Events, Context, Mode, Type> }
  | ((selection: StateMachineSelection<State, Events, Context, Mode, Type>) => Selected<Mode, State | undefined>);

/** The transitions of a state, or of the machine for any state, by event type. */
export type StateMachineTransitions<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> = { readonly [Type in EventType<Events>]?: StateMachineTransition<State, Events, Context, Mode, Type> };

/** A state: its transitions, and the actions run on entering and leaving it. */
export interface StateMachineStateConfig<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> {
  readonly on?: StateMachineTransitions<State, Events, Context, Mode>;
  readonly entry?: StateMachineActions<State, Events, Context, Mode>;
  readonly exit?: StateMachineActions<State, Events, Context, Mode>;
}

/** A machine as a schema, in XState's words: `initial`, `context`, `states`, and `on` for any-state transitions. */
export type StateMachineConfig<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> = {
  readonly initial: NoInfer<State>;
  /** Transitions taken from any state; a state's own transition for the same event wins. */
  readonly on?: StateMachineTransitions<State, Events, Context, Mode>;
  readonly states: { readonly [S in State]: StateMachineStateConfig<State, Events, Context, Mode> };
} & (undefined extends Context ? { readonly context?: Context } : { readonly context: Context });

/** What `send` did. `queued`: sent from an action, it runs right after the current transition. */
export type StateMachineResult<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> =
  | {
      readonly status: 'done';
      readonly state: State;
      readonly change: StateMachineChange<State, Events, Context, Mode>;
    }
  | { readonly status: 'refused'; readonly state: State; readonly reason: string }
  | { readonly status: 'failed'; readonly state: State; readonly error: Error }
  | { readonly status: 'queued'; readonly state: State };

/** What `send` returns: the result, or a promise of it in the async machine. */
export type StateMachineAnswer<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> = Mode extends 'async'
  ? Promise<StateMachineResult<State, Events, Context, Mode>>
  : StateMachineResult<State, Events, Context, Mode>;

/** What the machine emits: `stateChanged` after every transition taken. */
export interface StateMachineEvents<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> {
  stateChanged: StateMachineChange<State, Events, Context, Mode>;
}

/** How a machine is created: `logger` gets failures and the lines of log actions. */
export interface StateMachineOptions {
  readonly logger?: StateMachineLogger;
}

/** A running machine. It starts in `initial` without running its `entry`. */
export interface IStateMachine<
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
> {
  readonly state: State;
  readonly context: Context;
  /** The logger given at creation; log actions write to it. */
  readonly logger: StateMachineLogger | undefined;
  /** Whether a transition for `type` is declared from the current state; never calls a target selector. */
  can(type: EventType<Events>): boolean;
  /** Sends an event; data is required where its type declares it. Never throws: a failure is a `failed` result. */
  send<Type extends EventType<Events>>(
    type: Type,
    ...data: EventArguments<Events[Type]>
  ): StateMachineAnswer<State, Events, Context, Mode>;
  on(event: 'stateChanged', listener: Listener<StateMachineChange<State, Events, Context, Mode>>): Unsubscribe;
  off(event: 'stateChanged', listener: Listener<StateMachineChange<State, Events, Context, Mode>>): void;
}
