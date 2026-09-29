import isNil from '../objects/isNil';

/**
 * Throws when `value` is `null` or `undefined`, and narrows it for the code after the call.
 *
 * @template T - The type of the value.
 * @param {T} value - The value to check.
 * @param {...string} messages - Words added to the error message, joined by spaces.
 * @returns {void}
 */
export function assertIsNonNullable<T>(value: T, ...messages: string[]): asserts value is NonNullable<T> {
  if (isNil(value)) {
    throw new Error(`Nullish assertion Error: "${String(value)}"; ${messages.join(' ')}`.trim());
  }
}
