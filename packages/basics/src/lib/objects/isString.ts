/** Whether `value` is a string primitive; a boxed `new String()` is an object and does not count. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
