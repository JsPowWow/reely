import { hasProperty, hasSome, isNil } from '@reely/utils';

import { computed, signal } from '../reactive/preact-like/preact-like.signal';

import type { Computed } from '../reactive/preact-like/preact-like.signal';

/** Any machine config: the initial state, and per state the event names and the states they lead to. */
interface AnyMachineConfig {
  initial: string;
  states: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

/** The states of a config: the keys of `states`. */
export type MachineState<C extends AnyMachineConfig> = keyof C['states'] & string;

/** The events of a config: every event any state accepts. */
export type MachineEvent<C extends AnyMachineConfig> = {
  [S in MachineState<C>]: keyof C['states'][S];
}[MachineState<C>] &
  string;

/** A config whose initial state and every transition name a state of the config. */
type CheckedMachineConfig<C extends AnyMachineConfig> = {
  initial: MachineState<C>;
  states: { [S in MachineState<C>]: { [E in keyof C['states'][S]]: MachineState<C> } };
};

/** @template S - The states. @template E - The events. */
export interface Machine<S extends string, E extends string> {
  /** The current state, to read in markup, effects and computeds. */
  readonly state: Computed<S>;
  /** Moves along the transition `event` names from the current state; `false` when there is none. */
  send: (event: E) => boolean;
  /** Whether the current state accepts `event`; reactive like any read of `state`. */
  can: (event: E) => boolean;
}

/**
 * A state machine over a signal: the state moves only along the transitions of the config, so
 * a view can never be in a state it has no way into. States and events are typed from the
 * config. To enter and leave a state, read it in an effect:
 * `effect(() => { if (race.state.value === 'countdown') { …; onCleanup(leave); } })`.
 *
 * @template C - The config, inferred with its literal names.
 * @param {C} config - The initial state and, per state, the event names and their target states.
 * @returns {Machine<MachineState<C>, MachineEvent<C>>} The state and the functions that move it.
 */
export const machine = <const C extends AnyMachineConfig>(
  config: C & CheckedMachineConfig<C>
): Machine<MachineState<C>, MachineEvent<C>> => {
  type S = MachineState<C>;
  const transitions: Readonly<Record<string, Readonly<Record<string, string>>>> = config.states;
  const isState = (name: string | undefined): name is S => hasSome(name) && hasProperty(name, transitions);
  const current = signal<S>(config.initial);
  const next = (from: S, event: string): S | undefined => {
    const to = transitions[from]?.[event];
    return isState(to) ? to : undefined;
  };
  return {
    state: computed(() => current.value),
    send: (event): boolean => {
      const to = next(current.peek(), event);
      if (isNil(to)) {
        return false;
      }
      current.value = to;
      return true;
    },
    can: (event): boolean => hasSome(next(current.value, event)),
  };
};
