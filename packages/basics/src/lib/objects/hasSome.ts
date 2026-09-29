/** Whether `value` is neither `null` nor `undefined`. */
export function hasSome<T>(value: unknown): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
