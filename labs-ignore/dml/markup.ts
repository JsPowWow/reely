import type { ReelyNode } from '@reely/dommy';

/**
 * Variant A, generators. Builds children with statements (`for`, `if`, `switch`, `let`,
 * `try`): every `yield` adds one child, `yield*` adds all the children of another builder.
 * The block is the function body, so it always closes: there is no `end` to forget.
 * The result is a plain list of children, rendered once, like any static children.
 */
export const markup = (build: () => Iterable<ReelyNode>): ReelyNode[] => Array.from(build());
