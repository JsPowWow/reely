import { forEachSettled, hasSome, isSomeFunction, reportUncaught } from '@reely/basics';
import type { EventArguments, EventsMap, EventType } from '@reely/emitter';
import { EventEmitter } from '@reely/emitter';
import { AsyncQueue, SyncQueue } from '@reely/queue';
import type { Bivariant } from '@reely/utils';
import { isPromiseLike, isValidRecordKey, toErrorWithMessage } from '@reely/utils';

import type {
  IStateMachine,
  StateMachineActions,
  StateMachineAnswer,
  StateMachineChange,
  StateMachineConfig,
  StateMachineEvent,
  StateMachineEvents,
  StateMachineLogger,
  StateMachineMode,
  StateMachineOptions,
  StateMachineResult,
  StateMachineState,
  StateMachineStep,
  StateMachineTransition,
} from './types';

type Steps<
  State extends StateMachineState,
  Events extends EventsMap,
  Context,
  Mode extends StateMachineMode
> = Generator<unknown, StateMachineResult<State, Events, Context, Mode>, unknown>;

/** Runs the steps of one transition; `nested` when sent from inside a transition, which then answers `queued`. */
type Schedule<State extends StateMachineState, Events extends EventsMap, Context, Mode extends StateMachineMode> = (
  steps: () => Steps<State, Events, Context, Mode>,
  nested: boolean,
  state: State
) => StateMachineAnswer<State, Events, Context, Mode>;

// `send`'s types tie the data to the type; the tuple of optional data only hides that from the compiler
const eventOf = <Events extends EventsMap, Type extends EventType<Events>>(
  type: Type,
  data: Events[Type]
): StateMachineEvent<Events, Type> => ({ type, data });

// own keys only: an event named `toString` finds no transition
const own = <Table extends object, Key extends keyof Table>(
  table: Table | undefined,
  key: Key
): Table[Key] | undefined => (hasSome(table) && Object.hasOwn(table, key) ? table[key] : undefined);

class Core<State extends StateMachineState, Events extends EventsMap, Context, Mode extends StateMachineMode> {
  public state: State;
  public readonly context: Context;
  public readonly emitter = new EventEmitter<StateMachineEvents<State, Events, Context, Mode>>();
  /** The face actions get: its `send` answers `queued` while a transition runs. */
  public readonly forActions: IStateMachine<State, Events, Context, Mode> = new Machine(this, true);
  private transitioning = false;
  // while the machine calls an action, a selector or a listener, up to its first `await`, a `send` comes from inside
  private calling = false;

  public constructor(
    private readonly config: StateMachineConfig<State, Events, Context, Mode>,
    public readonly logger: StateMachineLogger | undefined,
    private readonly schedule: Schedule<State, Events, Context, Mode>
  ) {
    if (!this.isState(config.initial)) {
      throw new TypeError(`The initial state "${String(config.initial)}" is not among the states`);
    }
    this.state = config.initial;
    // the config may leave `context` out only where `Context` takes `undefined`
    const read: Bivariant<(config: { readonly context?: Context }) => Context> = (withContext: {
      readonly context: Context;
    }) => withContext.context;
    this.context = read(config);
  }

  public can(type: EventType<Events>): boolean {
    return hasSome(this.transitionOf(type));
  }

  public send<Type extends EventType<Events>>(
    type: Type,
    data: EventArguments<Events[Type]>,
    nested: boolean
  ): StateMachineAnswer<State, Events, Context, Mode> {
    const toEvent: Bivariant<(type: Type, data: Events[Type] | undefined) => StateMachineEvent<Events, Type>> = eventOf;
    const event = toEvent(type, data[0]);
    return this.schedule(() => this.steps(event), (nested && this.transitioning) || this.calling, this.state);
  }

  private *steps(event: StateMachineEvent<Events>): Steps<State, Events, Context, Mode> {
    const from = this.state;
    const transition = this.transitionOf(event.type);
    if (!hasSome(transition)) {
      return { status: 'refused', state: from, reason: `No transition from "${String(from)}" by "${event.type}"` };
    }
    this.transitioning = true;
    try {
      const { target, actions } = isSomeFunction(transition)
        ? { target: yield this.call(transition, { from, event, context: this.context, machine: this.forActions }) }
        : isValidRecordKey(transition)
        ? { target: transition }
        : transition;
      if (target === undefined) {
        return { status: 'refused', state: from, reason: `The target selector of "${event.type}" chose no state` };
      }
      if (!this.isState(target)) {
        throw new Error(`No state "${String(target)}" to go to from "${String(from)}" by "${event.type}"`);
      }
      const change = (step: StateMachineStep): StateMachineChange<State, Events, Context, Mode> =>
        Object.freeze({ step, from, to: target, event, context: this.context, machine: this.forActions });
      if (target !== from) {
        yield* this.run(this.config.states[from].exit, change('exit'));
      }
      yield* this.run(actions, change('transition'));
      this.state = target;
      // the state has changed: listeners hear of it even when `entry` throws
      const errors: unknown[] = [];
      try {
        if (target !== from) {
          yield* this.run(this.config.states[target].entry, change('entry'));
        }
      } catch (error) {
        errors.push(error);
      }
      const changed = change('changed');
      try {
        this.call(() => this.emitter.emit('stateChanged', changed), undefined);
      } catch (error) {
        errors.push(error);
      }
      forEachSettled(
        errors,
        (error) => {
          throw error;
        },
        `Entering "${String(target)}" and telling its listeners threw`
      );
      return { status: 'done', state: target, change: changed };
    } catch (error) {
      const failure = toErrorWithMessage(error);
      this.logger?.error(`The machine failed to take "${event.type}" from "${String(from)}"`, failure);
      return { status: 'failed', state: this.state, error: failure };
    } finally {
      this.transitioning = false;
    }
  }

  private *run(
    actions: StateMachineActions<State, Events, Context, Mode> | undefined,
    change: StateMachineChange<State, Events, Context, Mode>
  ): Generator<unknown> {
    for (const action of [actions ?? []].flat()) {
      yield this.call(action, change);
    }
  }

  private call<T>(action: (argument: T) => unknown, argument: T): unknown {
    this.calling = true;
    try {
      return action(argument);
    } finally {
      this.calling = false;
    }
  }

  private isState(value: unknown): value is State {
    return isValidRecordKey(value) && Object.hasOwn(this.config.states, value);
  }

  private transitionOf(type: EventType<Events>): StateMachineTransition<State, Events, Context, Mode> | undefined {
    return own(this.config.states[this.state].on, type) ?? own(this.config.on, type);
  }
}

/** A face of the machine: the one the factories return, or the one actions get (`nested`). */
class Machine<State extends StateMachineState, Events extends EventsMap, Context, Mode extends StateMachineMode>
  implements IStateMachine<State, Events, Context, Mode>
{
  public readonly on: IStateMachine<State, Events, Context, Mode>['on'];
  public readonly off: IStateMachine<State, Events, Context, Mode>['off'];

  public constructor(private readonly core: Core<State, Events, Context, Mode>, private readonly nested: boolean) {
    this.on = core.emitter.on;
    this.off = core.emitter.off;
  }

  public get state(): State {
    return this.core.state;
  }

  public get context(): Context {
    return this.core.context;
  }

  public get logger(): StateMachineLogger | undefined {
    return this.core.logger;
  }

  public readonly can = (type: EventType<Events>): boolean => this.core.can(type);

  public readonly send = <Type extends EventType<Events>>(
    type: Type,
    ...data: EventArguments<Events[Type]>
  ): StateMachineAnswer<State, Events, Context, Mode> => this.core.send(type, data, this.nested);
}

function runSync<R>(steps: Generator<unknown, R, unknown>, report: (error: unknown) => void): R {
  let step = steps.next();
  while (step.done !== true) {
    if (isPromiseLike(step.value)) {
      step.value.then(undefined, report);
      step = steps.throw(
        new TypeError('A sync machine got a promise from an action or a selector; use createAsyncStateMachine')
      );
    } else {
      step = steps.next(step.value);
    }
  }
  return step.value;
}

async function runAsync<R>(steps: Generator<unknown, R, unknown>): Promise<R> {
  let step = steps.next();
  while (step.done !== true) {
    let value: unknown;
    try {
      value = await step.value;
    } catch (error) {
      step = steps.throw(error);
      continue;
    }
    step = steps.next(value);
  }
  return step.value;
}

/**
 * A machine whose transitions run inside `send`, one after another (ADR 0001).
 * @throws {TypeError} When `initial` is not among the states.
 */
export function createStateMachine<State extends StateMachineState, Events extends EventsMap, Context = undefined>(
  config: StateMachineConfig<State, Events, Context>,
  { logger }: StateMachineOptions = {}
): IStateMachine<State, Events, Context> {
  const queue = new SyncQueue<StateMachineResult<State, Events, Context>>();
  // a promise the sync machine refused may still reject: its error is not lost
  const report = (error: unknown): void =>
    hasSome(logger)
      ? logger.error('A sync machine left a promise behind, and it rejected', error)
      : reportUncaught(error);
  const core = new Core<State, Events, Context, 'sync'>(config, logger, (steps, _nested, state) => {
    const run = queue.add(() => runSync(steps(), report));
    return run.status === 'done' ? run.result : { status: 'queued', state };
  });
  return new Machine(core, false);
}

/**
 * A machine that awaits target selectors and actions, one transition at a time (ADR 0001): `send` resolves once its
 * transition has run. Inside an action, send through `change.machine`: it answers `queued` at once.
 * @throws {TypeError} When `initial` is not among the states.
 */
export function createAsyncStateMachine<State extends StateMachineState, Events extends EventsMap, Context = undefined>(
  config: StateMachineConfig<State, Events, Context, 'async'>,
  { logger }: StateMachineOptions = {}
): IStateMachine<State, Events, Context, 'async'> {
  const queue = new AsyncQueue<StateMachineResult<State, Events, Context, 'async'>>();
  const core = new Core<State, Events, Context, 'async'>(config, logger, (steps, nested, state) => {
    const result = queue.add(() => runAsync(steps()));
    return nested ? Promise.resolve({ status: 'queued', state }) : result;
  });
  return new Machine(core, false);
}
