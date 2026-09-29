import type { Nullable } from '@reely/utils';
import { code, div, ins, p, pre, span } from '@reely/dommy';
import { isNil } from '@reely/utils';

import css from './demo.module.css';

import type { SourceLines, SourceToken } from '../highlight/source.types';

/** Marks the lines of `current` outside its longest common subsequence with `previous`. */
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

/** A blank line is inserted only between inserted code; next to unchanged code it is a separator. */
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
  source: SourceLines;
  /** Says what the listing shows, and what is marked in it. */
  caption: string;
  /** The source this one grows from: lines it lacks are marked; nothing is marked without it. */
  previous?: Nullable<SourceLines>;
}

const toText = (line: readonly SourceToken[]): string => line.map((token) => token.content).join('');

const renderToken = ({ content, color }: SourceToken): HTMLSpanElement =>
  span(isNil(color) ? null : { styles: { color } }, content);

let sourceViews = 0;

/** Shows the source of a demo under its caption, marking the lines added since `previous`. */
export const SourceView = ({ source, caption, previous }: SourceViewProps): HTMLElement => {
  // ids unique per view, for the listing's accessible name
  const titleId = `source-title-${++sourceViews}`;
  const captionId = `source-caption-${sourceViews}`;
  const lines = source.map(toText);
  const inserted = isNil(previous)
    ? lines.map(() => false)
    : markBlankLines(lines, markInsertedLines(previous.map(toText), lines));
  return div(
    { className: css.sourcePanel },
    p(
      { className: css.sourceCaption },
      span({ id: titleId, className: 'visually-hidden' }, 'Source'),
      span({ id: captionId }, caption)
    ),
    pre(
      // focusable, so a keyboard can scroll a long line into view
      { className: css.source, tabIndex: 0, aria: { ariaLabelledby: `${titleId} ${captionId}` } },
      code(
        null,
        source.map((line, index) =>
          inserted[index]
            ? ins({ className: css.added }, line.map(renderToken), '\n')
            : span({ className: css.line }, line.map(renderToken), '\n')
        )
      )
    )
  );
};
