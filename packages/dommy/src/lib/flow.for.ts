import { isInstanceOf } from '@reely/utils';

import { getDommyLogger } from './config';
import { getOwner, withOwner } from './reactive/owner';
import { signal } from './reactive/preact-like/preact-like.signal';
import { bindValue } from './utils/element.bindings';
import { toNodes } from './utils/element.children';

import type { Signal } from './reactive/preact-like/preact-like.signal';
import type { ChildDOMElement, ReactiveValue } from './types/dommy.types';

export interface ForProps<T> {
  /** The items: a signal or a getter of an array. */
  each: ReactiveValue<readonly T[]>;
  /**
   * The key of an item: an item with the same key keeps its row. Named `by`, since JSX keeps
   * `key` for itself.
   */
  by: (item: T) => PropertyKey;
  /** Renders one row, once per key; `item` and `index` follow later updates of that key. */
  children: (item: ReactiveValue<T>, index: ReactiveValue<number>) => ChildDOMElement;
}

interface Row<T> {
  /** The nodes of the row, moved and removed together. */
  readonly nodes: readonly Node[];
  readonly item: Signal<T>;
  readonly index: Signal<number>;
  readonly dispose: VoidFunction;
}

/**
 * Marks the positions that stay in place: the longest increasing run of old positions.
 * Rows outside it are the fewest that must move to reach the new order.
 */
const markStaying = (oldPositions: readonly number[]): boolean[] => {
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
  const staying = oldPositions.map(() => false);
  for (let i = tails.at(-1) ?? -1; i >= 0; i = previous[i] ?? -1) {
    staying[i] = true;
  }
  return staying;
};

/** Gives focus back to an element that lost it while its row moved. */
const keepFocus = (move: VoidFunction): void => {
  const focused = document.activeElement;
  move();
  if (isInstanceOf(HTMLElement, focused) && focused.isConnected && document.activeElement !== focused) {
    focused.focus({ preventScroll: true });
  }
};

/**
 * Renders a keyed list: one row per key, created once. When the items change, a row whose key
 * stays keeps its node and gets the new item and index through `item()` and `index()`; rows of
 * new keys are created, rows of gone keys are removed with their subscriptions, and the nodes
 * that changed places are moved, never recreated, so focus and state inside rows survive.
 *
 * @template T - The item type.
 * @param {ForProps<T>} props - The items, their key (`by`) and the row renderer.
 * @returns {DocumentFragment} The rows followed by the anchor the list keeps its place by.
 */
export const For = <T,>({ each, by, children }: ForProps<T>): DocumentFragment => {
  const owner = getOwner();
  const end = document.createComment('For');
  const fragment = document.createDocumentFragment();
  fragment.append(end);
  let rows = new Map<PropertyKey, Row<T>>();

  const createRow = (value: T, position: number): Row<T> =>
    withOwner((dispose) => {
      const item = signal(value);
      const index = signal(position);
      return { nodes: toNodes(children(item, index)), item, index, dispose };
    }, owner);

  const update = (items: readonly T[]): void => {
    const parent = end.parentNode;
    if (parent === null) {
      return;
    }
    const oldPositions = new Map(Array.from(rows.keys(), (itemKey, position) => [itemKey, position]));
    const next = new Map<PropertyKey, Row<T>>();
    for (const value of items) {
      const itemKey = by(value);
      if (next.has(itemKey)) {
        getDommyLogger()?.warn(`For: duplicate key ${String(itemKey)}; the item is not rendered`);
        continue;
      }
      const row = rows.get(itemKey);
      if (row === undefined) {
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
        for (const node of row.nodes) {
          parent.removeChild(node);
        }
      }
    }

    const ordered = Array.from(next);
    const staying = markStaying(ordered.map(([itemKey]) => oldPositions.get(itemKey) ?? -1));
    keepFocus(() => {
      let anchor: Node = end;
      for (let i = ordered.length - 1; i >= 0; i--) {
        const nodes = ordered[i]?.[1].nodes ?? [];
        for (let n = nodes.length - 1; n >= 0; n--) {
          const node = nodes[n];
          if (node === undefined) {
            continue;
          }
          if (staying[i] !== true || node.parentNode !== parent) {
            parent.insertBefore(node, anchor);
          }
          anchor = node;
        }
      }
    });
    rows = next;
  };

  bindValue(each, update);
  return fragment;
};
