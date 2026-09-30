import { toErrorWithMessage } from '@reely/basics';

/**
 * Describes any thrown value as text, the way an `Error` prints: `TypeError: No timing data`.
 */
export default function toErrorString(maybeError: unknown): string {
  return String(toErrorWithMessage(maybeError));
}
