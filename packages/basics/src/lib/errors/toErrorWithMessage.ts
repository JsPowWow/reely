import { hasSome } from '../objects/hasSome';
import { isString } from '../objects/isString';

const describe = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

/**
 * Any thrown value as an `Error`: an `Error` as it is; an object's string `message`, a thrown string,
 * or else the value as JSON, as the message of a new one.
 */
export function toErrorWithMessage(maybeError: unknown): Error {
  if (maybeError instanceof Error) {
    return maybeError;
  }
  const message: unknown = hasSome(maybeError) ? Reflect.get(Object(maybeError), 'message') : undefined;
  if (isString(message)) {
    return new Error(message);
  }
  return new Error(isString(maybeError) ? maybeError : describe(maybeError));
}
