import { appendingTags } from './tags';

/**
 * Variant B, `begin`/`end` as in van-dml, the VanJS add-on this lab started from: `begin(el)`
 * makes `el` the current parent (appending it to the one before), `end()` closes it, and the
 * tags in between land in the current parent on their own. The parent is module state.
 */
const parents: Element[] = [];

export const begin = <T extends Element>(parent: T): T => {
  parents.at(-1)?.append(parent);
  parents.push(parent);
  return parent;
};

export const end = (): void => {
  parents.pop();
};

/** Tags that land in the current parent, as van-dml's do. */
export const tags = appendingTags(() => parents.at(-1));

/** For the specs: how deep the stack is now. */
export const depth = (): number => parents.length;
