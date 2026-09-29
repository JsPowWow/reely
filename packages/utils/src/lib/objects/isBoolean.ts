export function isBoolean(source: unknown): source is boolean {
  return typeof source === 'boolean' || source instanceof Boolean;
}
