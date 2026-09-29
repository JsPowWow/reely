export default function isString(source: unknown): source is string {
  return typeof source === 'string' || source instanceof String;
}
