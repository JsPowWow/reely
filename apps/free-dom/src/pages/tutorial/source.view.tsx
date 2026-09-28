import type { Nullable } from '@reely/utils';
import { code, ins, pre, span } from '@reely/dommy';
import { isNil } from '@reely/utils';

import css from './tutorial.module.css';

/**
 * Marks the lines of `current` that are not part of the longest common subsequence with
 * `previous`: the lines a student would type to get from one step to the next.
 */
const markInsertedLines = (previous: readonly string[], current: readonly string[]): boolean[] => {
  const columns = current.length + 1;
  // common[i * columns + j] — LCS length of previous[i..] and current[j..]
  const common = new Uint16Array((previous.length + 1) * columns);
  const lcs = (i: number, j: number): number => common[i * columns + j] ?? 0;
  for (let i = previous.length - 1; i >= 0; i--) {
    for (let j = current.length - 1; j >= 0; j--) {
      common[i * columns + j] =
        previous[i] === current[j] ? lcs(i + 1, j + 1) + 1 : Math.max(lcs(i + 1, j), lcs(i, j + 1));
    }
  }
  const inserted = current.map(() => true);
  for (let i = 0, j = 0; i < previous.length && j < current.length; ) {
    if (previous[i] === current[j]) {
      inserted[j] = false;
      i++;
      j++;
    } else if (lcs(i + 1, j) >= lcs(i, j + 1)) {
      i++;
    } else {
      j++;
    }
  }
  return inserted;
};

interface SourceViewProps {
  source: string;
  previous?: Nullable<string>;
}

/**
 * Shows the source of a step; lines added since the previous step are marked as inserted.
 */
export const SourceView = ({ source, previous }: SourceViewProps): HTMLElement => {
  const lines = source.trimEnd().split('\n');
  const inserted = isNil(previous) ? lines.map(() => false) : markInsertedLines(previous.trimEnd().split('\n'), lines);
  return pre(
    { className: css.source, tabIndex: 0 },
    code(
      null,
      lines.map((line, index) =>
        inserted[index] ? ins({ className: css.added }, line, '\n') : span({ className: css.line }, line, '\n')
      )
    )
  );
};
