import { isSomeFunction } from '@reely/utils';

import { isFalsyElement } from './element.utils';
import { computed } from '../reactive/preact-like/preact-like.signal';

import type { ReactiveChildDOMElement, ValidChildDOMElement } from '../types/dommy.types';

/**
 * Converts a child value to text node data: `null`, `undefined` and `false` render nothing.
 *
 * @param {unknown} value - The child value.
 * @returns {string} The text to render.
 */
const toTextData = (value: unknown): string => (isFalsyElement(value) ? '' : String(value));

/**
 * Creates a text node bound to a reactive value: a change updates `text.data` in place,
 * the node itself is never replaced.
 *
 * @param {ReactiveChildDOMElement} read - A signal or a getter.
 * @returns {Text} The bound text node.
 */
export const toBoundTextNode = (read: ReactiveChildDOMElement): Text => {
  const text = document.createTextNode('');
  // TODO AR register the subscription in the owner (JsPowWow/reely#1, step 2)
  computed(read).subscribe((value) => {
    text.data = toTextData(value);
  });
  return text;
};

/**
 * Converts a valid child to a node or a string for `append`/`replaceChildren`.
 *
 * @param {ValidChildDOMElement} child - A node, a primitive or a reactive value.
 * @returns {Node | string} The node to insert, or the text of a static child.
 */
export const toChildNode = (child: ValidChildDOMElement): Node | string => {
  if (isSomeFunction(child)) {
    return toBoundTextNode(child);
  }
  return child instanceof Node ? child : toTextData(child);
};
