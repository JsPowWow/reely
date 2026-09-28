import type { Nullable } from '@reely/utils';
import { code, ins, pre, span } from '@reely/dommy';
import { hasSome } from '@reely/utils';

import css from './tutorial.module.css';

interface SourceViewProps {
  source: string;
  previous?: Nullable<string>;
}

/**
 * Shows the source of a step; lines that the previous step did not have are marked as inserted.
 */
export const SourceView = ({ source, previous }: SourceViewProps): HTMLElement => {
  const known = new Set((previous ?? '').split('\n').map((line) => line.trim()));
  const lines = source
    .trimEnd()
    .split('\n')
    .map((line) =>
      hasSome(previous) && !known.has(line.trim())
        ? ins({ className: css.added }, line, '\n')
        : span({ className: css.line }, line, '\n')
    );
  return pre({ className: css.source, tabIndex: 0 }, code(null, lines));
};
