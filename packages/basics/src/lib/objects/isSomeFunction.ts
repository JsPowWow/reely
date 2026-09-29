/**
 * Whether `value` can be called. Narrows a union to its functions; an unknown value becomes a function that takes
 * nothing it was not told about.
 */
export function isSomeFunction(value: unknown): value is (...parameters: never) => unknown {
  return typeof value === 'function';
}
