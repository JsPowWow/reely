import { meta, onCleanup } from '@reely/dommy';

/**
 * Describes the page for search results and link previews while it is shown, following the language; the tag
 * leaves with the page, so the next page never inherits a description that is not its own.
 */
export const describePage = (description: () => string): void => {
  const tag = meta({ name: 'description', content: description });
  document.head.append(tag);
  onCleanup(() => tag.remove());
};
