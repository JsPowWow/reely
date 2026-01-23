export function setPrototype<Result = unknown, P extends object = object, O extends object = object>(
  proto: P,
  object: O
): O & P & Result {
  if (!Reflect.setPrototypeOf(object, proto)) {
    throw new Error('Failed to set prototype of provided object.');
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return object as O & P & Result;
}
