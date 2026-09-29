/** Whether `value` is neither `null` nor `undefined`. */
export function hasSome<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
