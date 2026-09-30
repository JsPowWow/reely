import { effect, getOwner, signal, untracked, withOwner } from '@reely/signals';
import type { Signal } from '@reely/signals';
import { isInstanceOf, isNil } from '@reely/utils';

import { getDommyLogger } from './config';
import { toNodes } from './utils/element.children';
import { createAnchors, insertBefore, rangeOf, removeNodes } from './utils/element.range';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

export interface ForProps<T> {
  each: ReactiveValue<readonly T[]>;
  /** An item with the same key keeps its row. Named `by`, since JSX keeps `key` for itself. */
  by: (item: T) => PropertyKey;
  /** Renders one row, once per key; `item` and `index` follow later updates of that key. */
  children: (item: ReactiveValue<T>, index: ReactiveValue<number>) => ReelyNode;
}

interface Row<T> {
  /** The row is moved and removed as the range from `first` to `last`. */
  readonly first: Node;
  readonly last: Node;
  readonly item: Signal<T>;
  readonly index: Signal<number>;
  readonly dispose: VoidFunction;
}

// The longest increasing run of old positions: rows outside it are the fewest that must move.
const findStaying = (oldPositions: readonly number[]): Set<number> => {
  // tails[k]: index in oldPositions of the smallest tail of an increasing run of length k + 1
  const tails: number[] = [];
  const previous: number[] = oldPositions.map(() => -1);
  oldPositions.forEach((position, i) => {
    if (position < 0) {
      return;
    }
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if ((oldPositions[tails[middle] ?? 0] ?? 0) < position) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    previous[i] = low > 0 ? (tails[low - 1] ?? -1) : -1;
    tails[low] = i;
  });
  const staying = new Set<number>();
  for (let i = tails.at(-1) ?? -1; i >= 0; i = previous[i] ?? -1) {
    staying.add(i);
  }
  return staying;
};

// Moving a node blurs the element focused inside it.
const keepFocus = (move: VoidFunction): void => {
  const focused = document.activeElement;
  move();
  if (isInstanceOf(HTMLElement, focused) && focused.isConnected && document.activeElement !== focused) {
    focused.focus({ preventScroll: true });
  }
};

/**
 * Renders a keyed list: one row per key, created once and moved, never recreated, so focus and
 * state inside rows survive; a row of a gone key is removed with its subscriptions.
 */
export const For = <T,>({ each, by, children }: ForProps<T>): DocumentFragment => {
  const owner = getOwner();
  const { fragment, end } = createAnchors('For');
  let rows = new Map<PropertyKey, Row<T>>();

  const createRow = (value: T, position: number): Row<T> =>
    withOwner((dispose) => {
      const item = signal(value);
      const index = signal(position);
      // an empty row still needs a node to keep its place by
      const [first = document.createTextNode(''), ...rest] = toNodes(children(item, index));
      // the nodes become siblings, so the row is a range from its first node on
      document.createDocumentFragment().append(first, ...rest);
      return { first, last: rest.at(-1) ?? first, item, index, dispose };
    }, owner);

  const update = (items: readonly T[]): void => {
    const oldPositions = new Map(Array.from(rows.keys(), (itemKey, position) => [itemKey, position]));
    const next = new Map<PropertyKey, Row<T>>();
    for (const value of items) {
      const itemKey = by(value);
      if (next.has(itemKey)) {
        getDommyLogger()?.warn(`For: duplicate key ${String(itemKey)}; the item is not rendered`);
        continue;
      }
      const row = rows.get(itemKey);
      if (isNil(row)) {
        next.set(itemKey, createRow(value, next.size));
      } else {
        row.item.value = value;
        row.index.value = next.size;
        next.set(itemKey, row);
      }
    }

    for (const [itemKey, row] of rows) {
      if (!next.has(itemKey)) {
        row.dispose();
        removeNodes(rangeOf(row.first, row.last));
      }
    }

    const ordered = Array.from(next.keys());
    const staying = findStaying(ordered.map((itemKey) => oldPositions.get(itemKey) ?? -1));
    const fromLast = Array.from(next.values(), (row, i) => ({ row, stays: staying.has(i) })).reverse();
    keepFocus(() => {
      let anchor: Node = end;
      for (const { row, stays } of fromLast) {
        if (!stays) {
          insertBefore(anchor, rangeOf(row.first, row.last));
        }
        anchor = row.first;
      }
    });
    rows = next;
  };

  // every notification re-reads the list, not only a new array: a list changed in place is diffed too
  effect(() => {
    const items = each();
    untracked(() => update(items));
  });
  return fragment;
};
