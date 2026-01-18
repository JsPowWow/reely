import type { ILogger, WithUseLogger } from '@reely/logger';
import type { KeyValueObject, Nullable } from '@reely/utils';

export type DommyConfig = WithUseLogger<KeyValueObject>;

const dommyConfig: DommyConfig = {};

export const defineDommyConfig = (config: Partial<DommyConfig>): void => {
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
