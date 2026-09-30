import { toErrorWithMessage } from './toErrorWithMessage';

/** The message of whatever was thrown, for a banner or a log line: `messageOf(error)` in a `catch`. */
export function messageOf(maybeError: unknown): string {
  return toErrorWithMessage(maybeError).message;
}
