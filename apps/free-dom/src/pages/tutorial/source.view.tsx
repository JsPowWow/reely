import type { Nullable } from '@reely/utils';
import { code, div, ins, p, pre, span } from '@reely/dommy';
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

const isBlank = (line: string): boolean => line.trim() === '';

/**
 * A blank line belongs to an inserted block only when the code on both sides of it was
 * inserted; otherwise it separates the block from unchanged code and stays unmarked.
 */
const markBlankLines = (lines: readonly string[], inserted: readonly boolean[]): boolean[] => {
  const isInsertedCode = (index: number): boolean => !isBlank(lines[index] ?? '') && inserted[index] === true;
  const nearestCode = (from: number, step: 1 | -1): number => {
    let index = from;
    while (index >= 0 && index < lines.length && isBlank(lines[index] ?? '')) {
      index += step;
    }
    return index;
  };
  return lines.map((line, index) =>
    isBlank(line)
      ? isInsertedCode(nearestCode(index, -1)) && isInsertedCode(nearestCode(index, 1))
      : inserted[index] === true
  );
};

interface SourceViewProps {
  source: string;
  /** The source of the step this one grows from, with its number; nothing is marked without it. */
  previous?: Nullable<{ source: string; number: number }>;
}

let sourceViews = 0;

/**
 * Shows the source of a step under a caption that says what is marked: the lines added since
 * the previous step of the same demo.
 */
export const SourceView = ({ source, previous }: SourceViewProps): HTMLElement => {
  // ids unique per view, for the listing's accessible name
  const titleId = `source-title-${++sourceViews}`;
  const captionId = `source-caption-${sourceViews}`;
  const lines = source.trimEnd().split('\n');
  const inserted = isNil(previous)
    ? lines.map(() => false)
    : markBlankLines(lines, markInsertedLines(previous.source.trimEnd().split('\n'), lines));
  return div(
    { className: css.sourcePanel },
    p(
      { className: css.sourceCaption },
      span({ id: titleId, className: css.visuallyHidden }, 'Source'),
      span(
        { id: captionId },
        isNil(previous) ? 'A new demo starts here' : `Highlighted: new since step ${previous.number}`
      )
    ),
    pre(
      { className: css.source, aria: { ariaLabelledby: `${titleId} ${captionId}` } },
      code(
        null,
        lines.map((line, index) =>
          inserted[index] ? ins({ className: css.added }, line, '\n') : span({ className: css.line }, line, '\n')
        )
      )
    )
  );
};
