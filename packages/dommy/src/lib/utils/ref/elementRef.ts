import type { DOMElementRefObject } from '../../types/dommy.types';

export function createElementRef<T>(): DOMElementRefObject<T> {
  return { current: null };
}
