import isNil from '../objects/isNil';

/** Throws when `value` is nullish; `messages` are appended to the error. */
export function assertIsNonNullable<T>(value: T, ...messages: string[]): asserts value is NonNullable<T> {
  if (isNil(value)) {
    throw new Error(`Nullish assertion Error: "${String(value)}"; ${messages.join(' ')}`.trim());
  }
}
