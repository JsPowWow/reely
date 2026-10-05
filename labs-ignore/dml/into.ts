import { appendingTags } from './tags';

import type { Tags } from './tags';

/**
 * Variant C, `into(parent, (tags) => …)`: van-dml's short tags without its shared stack. The tags
 * the block gets append to `parent`, which the closure holds, so statements run in plain code,
 * an `await` changes nothing, and the block always closes with its brace.
 */
export const into = <T extends Element>(parent: T, build: (tags: Tags) => void): T => {
  build(appendingTags(() => parent));
  return parent;
};
