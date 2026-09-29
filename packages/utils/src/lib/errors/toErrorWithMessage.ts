import { hasStringMessage } from './hasStringMessage';
import isError from '../objects/isError';
import isString from '../objects/isString';

export default function toErrorWithMessage(maybeError: unknown): Error {
  if (isError(maybeError)) return maybeError;
  if (hasStringMessage(maybeError)) return new Error(maybeError.message);
  if (isString(maybeError)) return new Error(String(maybeError));

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}
