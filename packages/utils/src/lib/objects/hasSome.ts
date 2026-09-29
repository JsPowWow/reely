export function hasSome<T>(value: unknown): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
