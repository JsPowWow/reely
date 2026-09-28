import type { ReelyNode } from '@reely/dommy';
import { hasSome } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import guide from './guide.module.css';

/** A neighbouring page: where it is and what it is called. */
export interface PagerLink {
  href: string;
  title: string;
}

interface PagerProps {
  previous?: Nullable<PagerLink>;
  next?: Nullable<PagerLink>;
  /** Shown in place of the next link on the last page. */
  children?: ReelyNode;
}

/**
 * The previous and next links under a page; `followPagerKey` follows them on ← and →, by their `rel`.
 */
export const Pager = ({ previous, next, children }: PagerProps): Node => (
  <footer className={guide.pager}>
    {hasSome(previous) && (
      <a href={previous.href} rel='prev' aria={{ ariaKeyShortcuts: 'ArrowLeft' }}>
        Previous: {previous.title}
      </a>
    )}
    {hasSome(next) ? (
      <a className={guide.next} href={next.href} rel='next' aria={{ ariaKeyShortcuts: 'ArrowRight' }}>
        Next: {next.title}
      </a>
    ) : (
      children
    )}
  </footer>
);
