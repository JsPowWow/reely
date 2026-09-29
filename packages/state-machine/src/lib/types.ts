import type { EventArguments, EventsMap, EventType, Listener, Unsubscribe } from '@reely/emitter';

/** The name of a state. */
export type StateMachineState = PropertyKey;

/**
 * What a machine is made of: `state`, the names of its states; `events`, each event type with its data (`undefined`
 * for none); and `context`, if it has one, optional in the config where optional here.
 */
export interface StateMachineTypes {
  readonly state: StateMachineState;
  readonly events: EventsMap;
}

/** The context of a machine: `undefined` where its types declare none. */
export type StateMachineContext<M extends StateMachineTypes> = 'context' extends keyof M
  ? M['context' & keyof M]
  : undefined;

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
export type StateMachineEvent<
  M extends StateMachineTypes,
  Type extends EventType<M['events']> = EventType<M['events']>
> = {
  [T in Type]: { readonly type: T; readonly data: M['events'][T] };
}[Type];

/** The step of a transition an action runs at; listeners of `stateChanged` get `changed`. */
export type StateMachineStep = 'exit' | 'transition' | 'entry' | 'changed';

/** What an action and a listener get about one transition. */
export interface StateMachineChange<
  M extends StateMachineTypes,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<M['events']> = EventType<M['events']>
> {
  readonly step: StateMachineStep;
  readonly from: M['state'];
  readonly to: M['state'];
  readonly event: StateMachineEvent<M, Type>;
  readonly context: StateMachineContext<M>;
  /** The machine; `send` from it answers `queued` and runs its transition right after this one. */
  readonly machine: IStateMachine<M, Mode>;
}

/** What a target selector gets: the change before its target is known. */
export type StateMachineSelection<
  M extends StateMachineTypes,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<M['events']> = EventType<M['events']>
> = Omit<StateMachineChange<M, Mode, Type>, 'step' | 'to'>;

type Returned<Mode extends StateMachineMode, T> = Mode extends 'async' ? T | PromiseLike<T> : T;

// an async selector returns only a promise: TypeScript widens the state an async function returns where a plain value may come back too
type Selected<Mode extends StateMachineMode, T> = Mode extends 'async' ? PromiseLike<T> : T;

/** A function the machine runs at a step of a transition; the async machine awaits what it returns. */
export type StateMachineAction<
  M extends StateMachineTypes,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<M['events']> = EventType<M['events']>
> = (change: StateMachineChange<M, Mode, Type>) => Returned<Mode, void>;

/** One action, or several run in order. */
export type StateMachineActions<
  M extends StateMachineTypes,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<M['events']> = EventType<M['events']>
> = StateMachineAction<M, Mode, Type> | readonly StateMachineAction<M, Mode, Type>[];

/** The target of a transition: a state, a state with actions, or a selector that picks one (`undefined` refuses). */
export type StateMachineTransition<
  M extends StateMachineTypes,
  Mode extends StateMachineMode = 'sync',
  Type extends EventType<M['events']> = EventType<M['events']>
> =
  | M['state']
  | { readonly target: M['state']; readonly actions?: StateMachineActions<M, Mode, Type> }
  | ((selection: StateMachineSelection<M, Mode, Type>) => Selected<Mode, M['state'] | undefined>);

/** The transitions of a state, or of the machine for any state, by event type. */
export type StateMachineTransitions<M extends StateMachineTypes, Mode extends StateMachineMode = 'sync'> = {
  readonly [Type in EventType<M['events']>]?: StateMachineTransition<M, Mode, Type>;
};

/** A state: its transitions, and the actions run on entering and leaving it. */
export interface StateMachineStateConfig<M extends StateMachineTypes, Mode extends StateMachineMode = 'sync'> {
  readonly on?: StateMachineTransitions<M, Mode>;
  readonly entry?: StateMachineActions<M, Mode>;
  readonly exit?: StateMachineActions<M, Mode>;
}

/** A machine as a schema, in XState's words: `initial`, `context`, `states`, and `on` for any-state transitions. */
export type StateMachineConfig<M extends StateMachineTypes, Mode extends StateMachineMode = 'sync'> = {
  readonly initial: M['state'];
  /** Transitions taken from any state; a state's own transition for the same event wins. */
  readonly on?: StateMachineTransitions<M, Mode>;
  readonly states: { readonly [S in M['state']]: StateMachineStateConfig<M, Mode> };
} & (undefined extends StateMachineContext<M>
  ? { readonly context?: StateMachineContext<M> }
  : { readonly context: StateMachineContext<M> });

/** What `send` did. `queued`: sent from an action, it runs right after the current transition. */
export type StateMachineResult<M extends StateMachineTypes, Mode extends StateMachineMode = 'sync'> =
  | {
      readonly status: 'done';
      readonly state: M['state'];
      readonly change: StateMachineChange<M, Mode>;
    }
  | { readonly status: 'refused'; readonly state: M['state']; readonly reason: string }
  | { readonly status: 'failed'; readonly state: M['state']; readonly error: Error }
  | { readonly status: 'queued'; readonly state: M['state'] };

/** What `send` returns: the result, or a promise of it in the async machine. */
export type StateMachineAnswer<
  M extends StateMachineTypes,
  Mode extends StateMachineMode = 'sync'
> = Mode extends 'async' ? Promise<StateMachineResult<M, Mode>> : StateMachineResult<M, Mode>;

/** What the machine emits: `stateChanged` after every transition taken. */
export interface StateMachineEvents<M extends StateMachineTypes, Mode extends StateMachineMode = 'sync'> {
  stateChanged: StateMachineChange<M, Mode>;
}

/** How a machine is created: `logger` gets failures and the lines of log actions. */
export interface StateMachineOptions {
  readonly logger?: StateMachineLogger;
}

/** A running machine. It starts in `initial` without running its `entry`. */
export interface IStateMachine<M extends StateMachineTypes, Mode extends StateMachineMode = 'sync'> {
  readonly state: M['state'];
  readonly context: StateMachineContext<M>;
  /** The logger given at creation; log actions write to it. */
  readonly logger: StateMachineLogger | undefined;
  /** Whether a transition for `type` is declared from the current state; never calls a target selector. */
  can(type: EventType<M['events']>): boolean;
  /** Sends an event; data is required where its type declares it. Never throws: a failure is a `failed` result. */
  send<Type extends EventType<M['events']>>(
    type: Type,
    ...data: EventArguments<M['events'][Type]>
  ): StateMachineAnswer<M, Mode>;
  on(event: 'stateChanged', listener: Listener<StateMachineChange<M, Mode>>): Unsubscribe;
  off(event: 'stateChanged', listener: Listener<StateMachineChange<M, Mode>>): void;
}
