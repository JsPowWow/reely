import { forEachSettled, hasSome, isSomeFunction, reportUncaught, toErrorWithMessage } from '@reely/basics';
import type { EventArguments, EventType } from '@reely/emitter';
import { EventEmitter } from '@reely/emitter';
import { AsyncQueue, SyncQueue } from '@reely/queue';
import type { Bivariant } from '@reely/utils';
import { isPromiseLike, isValidRecordKey } from '@reely/utils';

import type {
  IStateMachine,
  StateMachineActions,
  StateMachineAnswer,
  StateMachineChange,
  StateMachineConfig,
  StateMachineContext,
  StateMachineEvent,
  StateMachineEvents,
  StateMachineLogger,
  StateMachineMode,
  StateMachineOptions,
  StateMachineResult,
  StateMachineStep,
  StateMachineTransition,
  StateMachineTypes,
} from './types';

type Steps<M extends StateMachineTypes, Mode extends StateMachineMode> = Generator<
  unknown,
  StateMachineResult<M, Mode>,
  unknown
>;

/** Runs the steps of one transition; `nested` when sent from inside a transition, which then answers `queued`. */
type Schedule<M extends StateMachineTypes, Mode extends StateMachineMode> = (
  steps: () => Steps<M, Mode>,
  nested: boolean,
  state: M['state']
) => StateMachineAnswer<M, Mode>;

// `send`'s types tie the data to the type; the tuple of optional data only hides that from the compiler
const eventOf = <M extends StateMachineTypes, Type extends EventType<M['events']>>(
  type: Type,
  data: M['events'][Type]
): StateMachineEvent<M, Type> => ({ type, data });

// own keys only: an event named `toString` finds no transition
const own = <Table extends object, Key extends keyof Table>(
  table: Table | undefined,
  key: Key
): Table[Key] | undefined => (hasSome(table) && Object.hasOwn(table, key) ? table[key] : undefined);

class Core<M extends StateMachineTypes, Mode extends StateMachineMode> {
  public state: M['state'];
  public readonly context: StateMachineContext<M>;
  public readonly emitter = new EventEmitter<StateMachineEvents<M, Mode>>();
  /** The face actions get: its `send` answers `queued` while a transition runs. */
  public readonly forActions: IStateMachine<M, Mode> = new Machine(this, true);
  private transitioning = false;
  // while the machine calls an action, a selector or a listener, up to its first `await`, a `send` comes from inside
  private calling = false;

  public constructor(
    private readonly config: StateMachineConfig<M, Mode>,
    public readonly logger: StateMachineLogger | undefined,
    private readonly schedule: Schedule<M, Mode>
  ) {
    if (!this.isState(config.initial)) {
      throw new TypeError(`The initial state "${String(config.initial)}" is not among the states`);
    }
    this.state = config.initial;
    // the config may leave `context` out only where the context takes `undefined`
    const read: Bivariant<(config: { readonly context?: unknown }) => StateMachineContext<M>> = (withContext: {
      readonly context: StateMachineContext<M>;
    }) => withContext.context;
    this.context = read(config);
  }

  public can(type: EventType<M['events']>): boolean {
    return hasSome(this.transitionOf(type));
  }

  public send<Type extends EventType<M['events']>>(
    type: Type,
    data: EventArguments<M['events'][Type]>,
    nested: boolean
  ): StateMachineAnswer<M, Mode> {
    const toEvent: Bivariant<(type: Type, data: M['events'][Type] | undefined) => StateMachineEvent<M, Type>> = eventOf;
    const event = toEvent(type, data[0]);
    return this.schedule(() => this.steps(event), (nested && this.transitioning) || this.calling, this.state);
  }

  private *steps(event: StateMachineEvent<M>): Steps<M, Mode> {
    const from = this.state;
    const transition = this.transitionOf(event.type);
    if (!hasSome(transition)) {
      return { status: 'refused', state: from, reason: `No transition from "${String(from)}" by "${event.type}"` };
    }
    this.transitioning = true;
    try {
      const step = isValidRecordKey(transition) ? { target: transition } : transition;
      const { target, actions } = isSomeFunction(step)
        ? { target: yield this.call(step, { from, event, context: this.context, machine: this.forActions }) }
        : step;
      if (target === undefined) {
        return { status: 'refused', state: from, reason: `The target selector of "${event.type}" chose no state` };
      }
      if (!this.isState(target)) {
        throw new Error(`No state "${String(target)}" to go to from "${String(from)}" by "${event.type}"`);
      }
      const change = (step: StateMachineStep): StateMachineChange<M, Mode> =>
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
    actions: StateMachineActions<M, Mode> | undefined,
    change: StateMachineChange<M, Mode>
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

  private isState(value: unknown): value is M['state'] {
    return isValidRecordKey(value) && Object.hasOwn(this.config.states, value);
  }

  private transitionOf(type: EventType<M['events']>): StateMachineTransition<M, Mode> | undefined {
    return own(this.config.states[this.state].on, type) ?? own(this.config.on, type);
  }
}

/** A face of the machine: the one the factories return, or the one actions get (`nested`). */
class Machine<M extends StateMachineTypes, Mode extends StateMachineMode> implements IStateMachine<M, Mode> {
  public readonly on: IStateMachine<M, Mode>['on'];
  public readonly off: IStateMachine<M, Mode>['off'];

  public constructor(private readonly core: Core<M, Mode>, private readonly nested: boolean) {
    this.on = core.emitter.on;
    this.off = core.emitter.off;
  }

  public get state(): M['state'] {
    return this.core.state;
  }

  public get context(): StateMachineContext<M> {
    return this.core.context;
  }

  public get logger(): StateMachineLogger | undefined {
    return this.core.logger;
  }

  public readonly can = (type: EventType<M['events']>): boolean => this.core.can(type);

  public readonly send = <Type extends EventType<M['events']>>(
    type: Type,
    ...data: EventArguments<M['events'][Type]>
  ): StateMachineAnswer<M, Mode> => this.core.send(type, data, this.nested);
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
export function createStateMachine<M extends StateMachineTypes = never>(
  config: StateMachineConfig<M>,
  { logger }: StateMachineOptions = {}
): IStateMachine<M> {
  const queue = new SyncQueue<StateMachineResult<M>>();
  // a promise the sync machine refused may still reject: its error is not lost
  const report = (error: unknown): void =>
    hasSome(logger)
      ? logger.error('A sync machine left a promise behind, and it rejected', error)
      : reportUncaught(error);
  const core = new Core<M, 'sync'>(config, logger, (steps, _nested, state) => {
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
export function createAsyncStateMachine<M extends StateMachineTypes = never>(
  config: StateMachineConfig<M, 'async'>,
  { logger }: StateMachineOptions = {}
): IStateMachine<M, 'async'> {
  const queue = new AsyncQueue<StateMachineResult<M, 'async'>>();
  const core = new Core<M, 'async'>(config, logger, (steps, nested, state) => {
    const result = queue.add(() => runAsync(steps()));
    return nested ? Promise.resolve({ status: 'queued', state }) : result;
  });
  return new Machine(core, false);
}
