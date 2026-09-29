/**
 * Calls `callback` for every item even when some calls throw, then throws their error: one as is,
 * several as an `AggregateError` with `message`. An error of `items` itself ends the calls and comes last.
 */
export function forEachSettled<T>(items: Iterable<T>, callback: (item: T) => void, message?: string): void {
  const errors: unknown[] = [];
  try {
    for (const item of items) {
      try {
        callback(item);
      } catch (error) {
        errors.push(error);
      }
    }
  } catch (error) {
    errors.push(error);
  }
  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw new AggregateError(errors, message ?? `${errors.length} calls threw`);
  }
}
