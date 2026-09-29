import { isSomeFunction } from '../objects/isSomeFunction';

/** Reports an error nobody can catch, as an uncaught one: the platform `reportError`, or a throw from a microtask. */
export function reportUncaught(error: unknown): void {
  const { reportError } = globalThis;
  if (isSomeFunction(reportError)) {
    reportError(error);
    return;
  }
  queueMicrotask(() => {
    throw error;
  });
}
