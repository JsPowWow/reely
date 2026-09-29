/**
 * Whether `value` can be called. Narrows a union to its functions; an `unknown` value becomes a function that cannot
 * be called until it is typed.
 */
export function isSomeFunction(value: unknown): value is (...parameters: never) => unknown {
  return typeof value === 'function';
}
