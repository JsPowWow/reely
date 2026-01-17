/**
 * @description Checks if provided value can be classified as a `BigInt`
 */
export function isBigInt(source: unknown): source is bigint {
  return typeof source === 'bigint' || source instanceof BigInt;
}
