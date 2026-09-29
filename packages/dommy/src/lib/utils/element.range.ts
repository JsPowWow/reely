import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

// A flow renders only between its anchors, so a range that holds a flow holds its current content too.
export const createAnchors = (name: string): { fragment: DocumentFragment; start: Comment; end: Comment } => {
  const start = document.createComment(name);
  const end = document.createComment(`/${name}`);
  const fragment = document.createDocumentFragment();
  fragment.append(start, end);
  return { fragment, start, end };
};

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

export const insertBefore = (anchor: Node, nodes: readonly Node[]): void => {
  for (const node of nodes) {
    anchor.parentNode?.insertBefore(node, anchor);
  }
};

export const removeNodes = (nodes: readonly Node[]): void => {
  for (const node of nodes) {
    node.parentNode?.removeChild(node);
  }
};
