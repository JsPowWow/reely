import objectTypeOf from './objectTypeOf';

export default function isObjectTypeOf(type: string, source: unknown): boolean {
  return objectTypeOf(source) === type;
}
