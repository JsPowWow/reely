export default function isNumber(source: unknown): source is number {
  return typeof source === 'number' || source instanceof Number;
}
