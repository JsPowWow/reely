/**
 * The built-in type of a value, as `Object.prototype.toString` names it: `'Array'`, `'Date'`,
 * `'Null'`, `'Number'`… Tells apart what `typeof` lumps together as `'object'`.
 *
 * @param {unknown} value - Any value.
 * @returns {string} The type name.
 */
export default function objectTypeOf(value: unknown): string {
  return Object.prototype.toString.call(value).slice('[object '.length, -1);
}
