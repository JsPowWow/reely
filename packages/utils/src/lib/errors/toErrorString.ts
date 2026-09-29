import toErrorWithMessage from './toErrorWithMessage';

/**
 * Describes any thrown value as text, the way an `Error` prints: `TypeError: No timing data`.
 *
 * @param {unknown} maybeError - The thrown value or the rejection reason.
 * @returns {string} The error's name and message.
 */
export default function toErrorString(maybeError: unknown): string {
  return String(toErrorWithMessage(maybeError));
}
