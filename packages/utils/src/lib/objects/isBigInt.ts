export function isBigInt(source: unknown): source is bigint {
  return typeof source === 'bigint' || source instanceof BigInt;
}
