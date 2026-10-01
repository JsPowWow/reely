import type { ILogger, WithUseLogger } from '@reely/logger';
import type { Nullable } from '@reely/utils';

export type DommyConfig = WithUseLogger<{
  /**
   * Warns through the logger of the first binding made outside any owner: a node built at module level
   * or in an event handler keeps its bindings while their signals live.
   */
  warnUnowned?: boolean;
}>;

const dommyConfig: DommyConfig = {};

/** Sets dommy's diagnostics: a logger for its warnings, and which of them to give. */
export const defineDommyConfig = (config: DommyConfig): void => {
  Object.assign(dommyConfig, config);
};

export const getDommyConfig = (): DommyConfig => {
  return dommyConfig;
};

export const getDommyLogger = (): Nullable<ILogger> => {
  if (getDommyConfig().useLogger === true) {
    return dommyConfig.logger;
  }
  return undefined;
};
