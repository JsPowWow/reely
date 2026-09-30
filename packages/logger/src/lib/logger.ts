import { hasSome } from '@reely/basics';

const DEFAULT_SCOPE = 'default';
const loggers = new Map<string, ScopedLogger>();
const enabledLoggers = new Set<ScopedLogger>();

// spelled out rather than `Console['log']`, so the types need neither the DOM nor the node lib
type LogMethod = (message?: unknown, ...optionalParams: unknown[]) => void;
type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface ILogger {
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  log: LogMethod;
  logWith: (logLevel: 'info' | 'warn' | 'error', prefix?: unknown, ...rest: unknown[]) => <V>(a: V) => V;
}

export type WithUseLogger<T extends object> =
  | (T & {
      useLogger: true;
      logger: ILogger;
    })
  | (T & {
      useLogger?: false;
      logger?: never;
    });

export interface ScopedLogger<S extends string = string> extends ILogger {
  setEnabled: (value: boolean) => ScopedLogger;
  readonly scope: S;
}

class ConsoleScopedLogger<S extends string> implements ScopedLogger<S> {
  public constructor(public readonly scope: S) {}

  public setEnabled = (value: boolean): this => {
    if (value) {
      enabledLoggers.add(this);
    } else {
      enabledLoggers.delete(this);
    }
    return this;
  };

  public log: LogMethod = (...parameters) => this.write('log', parameters);

  public info: LogMethod = (...parameters) => this.write('info', parameters);

  public warn: LogMethod = (...parameters) => this.write('warn', parameters);

  public error: LogMethod = (...parameters) => this.write('error', parameters);

  public logWith: ILogger['logWith'] =
    (logLevel, prefix, ...rest) =>
    <V>(value: V): V => {
      this[logLevel](...(hasSome(prefix) ? [prefix, value] : [value]), ...rest);
      return value;
    };

  private write(level: LogLevel, parameters: unknown[]): void {
    if (this.scope === DEFAULT_SCOPE || enabledLoggers.has(this)) {
      console[level](`[[${this.scope}]]\t`, ...parameters);
    }
  }
}

/** The logger of `scope`, the same one on every call; a named scope stays silent until `setEnabled(true)`. */
export const scopedLogger = (scope = DEFAULT_SCOPE): ScopedLogger => {
  const thisScope = scope || DEFAULT_SCOPE;
  let logger = loggers.get(thisScope);
  if (!logger) {
    logger = Object.freeze(new ConsoleScopedLogger(thisScope));
    loggers.set(thisScope, logger);
  }
  return logger;
};
