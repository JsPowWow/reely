import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

/**
 * Creates the two anchors a flow keeps its content between, in a fragment ready to insert.
 * Everything a flow renders later lies between them, so a range that holds a flow holds its
 * current content too.
 *
 * @param {string} name - The flow name, shown in the comments.
 * @returns {{ fragment: DocumentFragment; start: Comment; end: Comment }} The anchors and their fragment.
 */
export const createAnchors = (name: string): { fragment: DocumentFragment; start: Comment; end: Comment } => {
  const start = document.createComment(name);
  const end = document.createComment(`/${name}`);
  const fragment = document.createDocumentFragment();
  fragment.append(start, end);
  return { fragment, start, end };
};

/**
 * Collects the siblings from `first` to `last`, inclusive, as they are now.
 *
 * @param {Node} first - The first node of the range.
 * @param {Node} last - The last node of the range, a later sibling of `first`.
 * @returns {Node[]} The nodes of the range, in order.
 */
export const rangeOf = (first: Node, last: Node): Node[] => {
  const nodes: Node[] = [];
  for (let node: Nullable<Node> = first; hasSome(node); node = node.nextSibling) {
    nodes.push(node);
    if (node === last) {
      break;
    }
  }
  return nodes;
};

/**
 * Inserts nodes, in order, before an anchor; nothing happens while the anchor has no parent.
 *
 * @param {Node} anchor - The node to insert before.
 * @param {readonly Node[]} nodes - The nodes to insert or move.
 * @returns {void}
 */
export const insertBefore = (anchor: Node, nodes: readonly Node[]): void => {
  for (const node of nodes) {
    anchor.parentNode?.insertBefore(node, anchor);
  }
};

/**
 * Removes nodes from their parents; a node without a parent is skipped.
 *
 * @param {readonly Node[]} nodes - The nodes to remove.
 * @returns {void}
 */
export const removeNodes = (nodes: readonly Node[]): void => {
  for (const node of nodes) {
    node.parentNode?.removeChild(node);
  }
};
