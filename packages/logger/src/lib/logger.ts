import { isNil } from '@reely/utils';

const DEFAULT_LOGGER = 'default';
const logInstances = new Map<string, ScopedLogger>();
const enabledScopedLoggers = new Map();

export interface ILogger {
  info: Console['info'];
  warn: Console['warn'];
  error: Console['error'];
  log: Console['log'];
  logWith: (
    logLevel: 'info' | 'warn' | 'error',
    prefix?: Parameters<Console['log']>[0],
    ...rest: Parameters<Console['log']>
  ) => <V>(a: V) => V;
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
  get scope(): S;
}

const enableLogger = (logger: ScopedLogger, enable: boolean): void => {
  if (enable) {
    enabledScopedLoggers.set(logger, true);
  } else {
    enabledScopedLoggers.delete(logger);
  }
};

const isLoggerEnabled = (logger: ScopedLogger): boolean =>
  logger && (logger.scope === DEFAULT_LOGGER || enabledScopedLoggers.get(logger) === true);

class ConsoleScopedLogger<S extends string> implements ScopedLogger<S> {
  private readonly loggerScope: S;

  constructor(scope: S) {
    this.loggerScope = scope;
  }

  public get scope(): S {
    return this.loggerScope;
  }

  public get enabled(): boolean {
    return isLoggerEnabled(this);
  }

  public setEnabled = (value: boolean): this => {
    enableLogger(this, value);
    return this;
  };

  public log: ScopedLogger<S>['log'] = (message, ...optionalParams): void => {
    if (isLoggerEnabled(this)) {
      console.warn(`[[${this.loggerScope}]]\t`, message, ...optionalParams);
    }
  };

  public info: ScopedLogger<S>['info'] = (message, ...optionalParams): void => {
    if (isLoggerEnabled(this)) {
      console.info(`[[${this.loggerScope}]]\t`, message, ...optionalParams);
    }
  };

  public warn: ScopedLogger<S>['warn'] = (message, ...optionalParams): void => {
    if (isLoggerEnabled(this)) {
      console.warn(`[[${this.loggerScope}]]\t`, message, ...optionalParams);
    }
  };

  public error: ScopedLogger<S>['error'] = (message, ...optionalParams): void => {
    if (isLoggerEnabled(this)) {
      console.warn(`[[${this.loggerScope}]]\t`, message, ...optionalParams);
    }
  };

  public logWith: ScopedLogger<S>['logWith'] =
    (logLevel: 'info' | 'warn' | 'error', prefix, ...rest) =>
    <V>(v: V): V => {
      if (isLoggerEnabled(this)) {
        switch (logLevel) {
          case 'info': {
            this.info(...(isNil(prefix) ? [v] : [prefix, v]), ...rest);
            break;
          }
          case 'warn': {
            this.warn(...(isNil(prefix) ? [v] : [prefix, v]), ...rest);
            break;
          }
          case 'error': {
            this.error(...(isNil(prefix) ? [v] : [prefix, v]), ...rest);
            break;
          }
          default: {
            this.info(...(isNil(prefix) ? [v] : [prefix, v]), ...rest);
          }
        }
      }
      return v;
    };
}

export const scopedLogger = (scope = DEFAULT_LOGGER): ScopedLogger => {
  const thisScope = scope || DEFAULT_LOGGER;
  let logger = logInstances.get(scope);
  if (!logger) {
    logger = Object.freeze(new ConsoleScopedLogger(thisScope));
    logInstances.set(thisScope, logger);
  }
  return logger;
};
