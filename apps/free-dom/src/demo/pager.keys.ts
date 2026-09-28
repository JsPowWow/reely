import { hasProperty, isInstanceOf } from '@reely/utils';

const pagerRels = { ArrowLeft: 'prev', ArrowRight: 'next' } as const;

const typingTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isTypingTarget = (target: EventTarget | null): boolean =>
  isInstanceOf(HTMLElement, target) &&
  (target.isContentEditable || typingTags.has(target.tagName));

/**
 * Follows the pager's `rel="prev"` or `rel="next"` link on ← or →, so a reader or a presenter
 * can move through the pages from the keyboard. Keys with modifiers and keys typed into a field are left alone.
 */
export const followPagerKey = (event: KeyboardEvent): void => {
  const { key } = event;
  if (
    !hasProperty(key, pagerRels) ||
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingTarget(event.target)
  ) {
    return;
  }
  const link = document.querySelector(`a[rel="${pagerRels[key]}"]`);
  if (isInstanceOf(HTMLAnchorElement, link)) {
    event.preventDefault();
    link.click();
  }
};
