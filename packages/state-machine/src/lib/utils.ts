import type { EventsMap, EventType } from '@reely/emitter';
import { hasSome } from '@reely/utils';

import type { StateMachineState, StateMachineTransitionAction, StateMachineTransitionActionEffect } from './types';

// TODO AR split utils per files

export const logTransitionAction =
  (options?: { withContext?: boolean; withData?: boolean }) =>
  <State extends StateMachineState, Transitions extends EventsMap, Context extends NonNullable<unknown>>(
    action: StateMachineTransitionAction<Transitions, State, Context>
  ): void => {
    const { type, to, from, by, data, context } = action;
    const dataString = options?.withData === true ? `${hasSome(data) ? JSON.stringify(data) : '<no-data>'}` : '';
    const contextString = options?.withContext === true ? `with  ${JSON.stringify(context)}` : '';

    switch (type) {
      case 'stateExit': {
        console.log(`Leave: "${String(to)}" from "${String(from)}" by "${by}" ${dataString} ${contextString}`.trim());
        break;
      }
      case 'stateTransition': {
        console.log(
          `Transition: from "${String(from)}" to "${String(to)}" by "${by}" ${dataString}  ${contextString}`.trim()
        );
        break;
      }
      case 'stateEnter': {
        console.log(`Enter: "${String(to)}" from "${String(from)}" by "${by}" ${dataString}  ${contextString}`.trim());
        break;
      }
    }
  };
export const log = logTransitionAction();
export const logAction = logTransitionAction({ withData: true });
export const logWithContext = logTransitionAction({ withContext: true });

export const enqueue =
  <
    State extends StateMachineState,
    Transitions extends EventsMap,
    Context extends NonNullable<unknown>,
    StateTo extends StateMachineState,
    Transition extends EventType<Transitions>
  >(
    ...actions: StateMachineTransitionActionEffect<Transitions, State, Context, StateTo, Transition>[]
  ) =>
  (action: StateMachineTransitionAction<Transitions, State, Context, StateTo, Transition>): void => {
    actions.forEach((effect) => {
      effect(action);
    });
  };

type MatchActionHelper<
  State extends StateMachineState,
  Transitions extends EventsMap,
  Context extends NonNullable<unknown>
> = {
  when: <T extends EventType<Transitions>, S extends State>(
    pattern: { by?: T; to?: S },
    f: StateMachineTransitionActionEffect<Transitions, State, Context, S, T>
  ) => MatchActionHelper<State, Transitions, Context>;
};

function isActionOf<
  State extends StateMachineState,
  Transitions extends EventsMap,
  Context extends NonNullable<unknown>,
  S extends State,
  T extends EventType<Transitions>
>(
  pattern: { by?: T; to?: S },
  action: StateMachineTransitionAction<Transitions, State, Context>
): action is StateMachineTransitionAction<Transitions, State, Context, S, T> {
  return (!('by' in pattern) || action.by === pattern.by) && (!('to' in pattern) || action.to === pattern.to);
}

export function matchAction<
  State extends StateMachineState,
  Transitions extends EventsMap,
  Context extends NonNullable<unknown>
>(
  action: StateMachineTransitionAction<Transitions, State, Context, State>
): MatchActionHelper<State, Transitions, Context> {
  const matcher: MatchActionHelper<State, Transitions, Context> = {
    when: (pattern, f) => {
      if (isActionOf(pattern, action)) {
        f(action);
      }
      return matcher;
    },
  };
  return matcher;
}

type ActionEffectRunner<
  State extends StateMachineState,
  Transitions extends EventsMap,
  Context extends NonNullable<unknown>
> = {
  when: <T extends EventType<Transitions>, S extends State>(
    pattern: { by?: T; to?: S },
    f: StateMachineTransitionActionEffect<Transitions, State, Context, S, T>
  ) => ActionEffectRunner<State, Transitions, Context>;
  invokeAction: (a: StateMachineTransitionAction<Transitions, State, Context, State>) => void;
};

export const runActionEffect = <
  State extends StateMachineState,
  Transitions extends EventsMap,
  Context extends NonNullable<unknown>
>(): ActionEffectRunner<State, Transitions, Context> => {
  const effects: StateMachineTransitionActionEffect<Transitions, State, Context>[] = [];

  const runner: ActionEffectRunner<State, Transitions, Context> = {
    when: (pattern, f) => {
      effects.push((action) => {
        if (isActionOf(pattern, action)) {
          f(action);
        }
      });
      return runner;
    },
    invokeAction: (action) => {
      effects.forEach((effect) => effect(action));
    },
  };
  return runner;
};
