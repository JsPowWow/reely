export default function isError(maybeError: unknown): maybeError is Error {
  return maybeError instanceof Error;
}
