import type { EventsMap } from '@reely/emitter';
import { hasProperty, isPromiseLike, noop } from '@reely/utils';

import type { StateMachineChange, StateMachineMode, StateMachineState } from './types';

/** What a pattern can match: a change's event type and target. */
export interface MatchableChange {
  readonly event: { readonly type: PropertyKey };
  readonly to: PropertyKey;
}

/** Which changes a rule takes: by event type, by target, or both. */
export interface ChangePattern<Type, To> {
  readonly type?: Type;
  readonly to?: To;
}

/** A change narrowed by the pattern it matched. */
export type MatchedChange<Change extends MatchableChange, Type, To> = Change & {
  readonly event: Extract<Change['event'], { readonly type: Type }>;
  readonly to: To;
};

/** Adds a rule: `action` runs for the changes `pattern` matches. */
export type ActionRule<Change extends MatchableChange, Result> = <
  Type extends Change['event']['type'],
  To extends Change['to']
>(
  pattern: ChangePattern<Type, To>,
  action: (change: MatchedChange<Change, Type, To>) => unknown
) => Result;

/** The `flow` form: an action for the config; `when` returns a new one with one more rule. */
export interface ActionEffect<Change extends MatchableChange> {
  (change: Change): void | PromiseLike<void>;
  readonly when: ActionRule<Change, ActionEffect<Change>>;
}

/** The `pipe` form: matches the change in hand; `done` is the wait for what its functions returned, if any. */
export interface ActionMatcher<Change extends MatchableChange> {
  readonly when: ActionRule<Change, ActionMatcher<Change>>;
  readonly done: void | PromiseLike<void>;
}

function isMatch<Change extends MatchableChange, Type, To>(
  pattern: ChangePattern<Type, To>,
  change: Change
): change is MatchedChange<Change, Type, To> {
  return (
    (!hasProperty('type', pattern) || change.event.type === pattern.type) &&
    (!hasProperty('to', pattern) || change.to === pattern.to)
  );
}

const rule =
  <Change extends MatchableChange, Type, To>(
    pattern: ChangePattern<Type, To>,
    action: (change: MatchedChange<Change, Type, To>) => unknown
  ) =>
  (change: Change): unknown =>
    isMatch(pattern, change) ? action(change) : undefined;

const settled = (value: unknown): void | PromiseLike<void> => (isPromiseLike(value) ? value.then(noop) : undefined);

// the next function runs at once, or after the promise before it settles
const andThen = (done: void | PromiseLike<void>, next: () => unknown): void | PromiseLike<void> =>
  isPromiseLike(done) ? done.then(() => settled(next())) : settled(next());

const inOrder = <Argument>(
  actions: readonly ((argument: Argument) => unknown)[],
  argument: Argument
): void | PromiseLike<void> =>
  actions.reduce<void | PromiseLike<void>>((done, action) => andThen(done, () => action(argument)), undefined);

/** One action made of several, run in order; one returning a promise is awaited before the next. */
export const sequence =
  <Change>(...actions: readonly ((change: Change) => unknown)[]) =>
  (change: Change): void | PromiseLike<void> =>
    inOrder(actions, change);

const matcherOf = <Change extends MatchableChange>(
  change: Change,
  done: void | PromiseLike<void>
): ActionMatcher<Change> => {
  const when: ActionRule<Change, ActionMatcher<Change>> = (pattern, action) =>
    matcherOf(
      change,
      andThen(done, () => rule(pattern, action)(change))
    );
  return { when, done };
};

/**
 * Matches a change in hand (the `pipe` form): `matchAction(change).when({ type: 'start' }, …)`. Its functions run in
 * order, one returning a promise awaited before the next; in an async machine, return `.done` to have it awaited.
 */
export const matchAction = <Change extends MatchableChange>(change: Change): ActionMatcher<Change> =>
  matcherOf(change, undefined);

const effectOf = <Change extends MatchableChange>(
  rules: readonly ((change: Change) => unknown)[]
): ActionEffect<Change> => {
  const when: ActionRule<Change, ActionEffect<Change>> = (pattern, action) =>
    effectOf([...rules, rule(pattern, action)]);
  return Object.assign((change: Change) => inOrder(rules, change), { when });
};

/**
 * Describes the matching first and takes the change later (the `flow` form): an action for the config, whose rules
 * run in order, a promise awaited before the next.
 */
export const runActionEffect = <
  State extends StateMachineState,
  Events extends EventsMap,
  Context = undefined,
  Mode extends StateMachineMode = 'sync'
>(): ActionEffect<StateMachineChange<State, Events, Context, Mode>> => effectOf([]);
