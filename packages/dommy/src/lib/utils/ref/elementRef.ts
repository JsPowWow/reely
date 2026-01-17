import type { DOMElementRefObject } from '../../types/hyperscript.types';

export function createElementRef<T>(): DOMElementRefObject<T> {
  return { current: null };
}
