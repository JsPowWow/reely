import type { StateMachineLogger, StateMachineStep } from './types';

interface LoggedChange {
  readonly step: StateMachineStep;
  readonly from: PropertyKey;
  readonly to: PropertyKey;
  readonly event: { readonly type: PropertyKey; readonly data: unknown };
  readonly context: unknown;
  readonly machine: { readonly logger: StateMachineLogger | undefined };
}

const stepNames = { exit: 'Leave', transition: 'Transition', entry: 'Enter', changed: 'Changed' } as const;

interface LogOptions {
  readonly data?: boolean;
  readonly context?: boolean;
  readonly level?: 'log' | 'info' | 'warn';
}

// a line never fails a transition: data JSON cannot hold (cycles, BigInt) prints as a string
const print = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

const write = (change: LoggedChange, { data = false, context = false, level = 'log' }: LogOptions): void => {
  const withData = data ? ` with ${print(change.event.data)}` : '';
  const withContext = context ? ` in ${print(change.context)}` : '';
  change.machine.logger?.[level](
    `${stepNames[change.step]} "${String(change.from)}" → "${String(change.to)}" by "${String(
      change.event.type
    )}"${withData}${withContext}`
  );
};

/**
 * An action that writes the change to the machine's logger: the step, the states and the event, with its data or the
 * context when asked. Put it where a transition is worth a line; without a logger it writes nothing.
 */
export const logTransition =
  (options: LogOptions = {}) =>
  (change: LoggedChange): void =>
    write(change, options);

// plain functions, not `logTransition()` calls: a module-level call would stay in every bundle
/** Logs the step, the states and the event. */
export const log = (change: LoggedChange): void => write(change, {});
/** Logs as `log` does, with the event's data. */
export const logAction = (change: LoggedChange): void => write(change, { data: true });
/** Logs as `log` does, with the context. */
export const logWithContext = (change: LoggedChange): void => write(change, { context: true });
