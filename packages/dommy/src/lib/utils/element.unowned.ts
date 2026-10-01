import type { ILogger } from '@reely/logger';
import { getOwner } from '@reely/signals';
import { isNil } from '@reely/utils';

import { getDommyConfig, getDommyLogger } from '../config';


// the loggers already told: one warning each, not one per binding
let told: WeakSet<ILogger> | undefined;

/** Warns, once per logger, of a binding made outside any owner, when `warnUnowned` asks for it. */
export const reportIfUnowned = (): void => {
  const logger = getDommyLogger();
  if (isNil(logger) || getDommyConfig().warnUnowned !== true || !isNil(getOwner())) {
    return;
  }
  told ??= new WeakSet();
  if (!told.has(logger)) {
    told.add(logger);
    logger.warn(
      'A binding was made outside any owner, so nothing releases it: build the view inside `mount` or a flow branch.'
    );
  }
};
