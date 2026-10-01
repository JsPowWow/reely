import { Fragment } from '@reely/dommy';

import type { DommyElement, ReelyNode } from '@reely/dommy';

/**
 * Variant B, `begin`/`end` as a `using` declaration: `using _ = within(ul)` makes `ul` the
 * current parent until the block closes, and `add(...)` appends to it. The block closes the
 * scope, so `end` is never forgotten; the current parent is module state.
 */
const parents: DommyElement[] = [];

export const within = (parent: DommyElement): Disposable => {
  parents.push(parent);
  return {
    [Symbol.dispose]: (): void => {
      parents.splice(parents.lastIndexOf(parent), 1);
    },
  };
};

export const add = (...children: ReelyNode[]): void => {
  const parent = parents.at(-1);
  if (parent === undefined) {
    throw new Error('add: no parent, call it inside a `using within(...)` block');
  }
  parent.append(Fragment({ children }));
};

/**
 * Variant C, `begin`/`end`: the same stack, closed by hand. Nothing checks the
 * balance: a missing `end` leaves the parent current for everything that follows.
 */
export const begin = <T extends DommyElement>(parent: T): T => {
  parents.push(parent);
  return parent;
};

export const end = (): void => {
  parents.pop();
};

/** For the specs: how deep the stack is now. */
export const depth = (): number => parents.length;
