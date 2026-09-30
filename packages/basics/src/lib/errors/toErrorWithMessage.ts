import { hasSome } from '../objects/hasSome';
import { isString } from '../objects/isString';

// a getter that throws is read as no message at all
const messageIn = (value: unknown): unknown => {
  try {
    return hasSome(value) ? Reflect.get(Object(value), 'message') : undefined;
  } catch {
    return undefined;
  }
};

// an Error from another realm (an iframe, a `vm` context) fails `instanceof` but keeps its tag
const isError = (value: unknown, message: unknown): value is Error =>
  value instanceof Error || (isString(message) && Object.prototype.toString.call(value) === '[object Error]');

const asText = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

/**
 * Any thrown value as an `Error`: an `Error` as it is, one from another realm too; an object's string
 * `message`, a thrown string, or else the value as JSON, as the message of a new one.
 */
export function toErrorWithMessage(maybeError: unknown): Error {
  const message = messageIn(maybeError);
  if (isError(maybeError, message)) {
    return maybeError;
  }
  if (isString(message)) {
    return new Error(message);
  }
  return new Error(isString(maybeError) ? maybeError : asText(maybeError));
}
