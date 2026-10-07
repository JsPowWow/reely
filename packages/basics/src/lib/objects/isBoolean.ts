/** Whether `value` is `true` or `false`; a boxed `new Boolean()` is an object and does not count. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}
