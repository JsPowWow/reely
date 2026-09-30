import { isString } from '@reely/basics';

/**
 * A lowercase, hyphen-separated form of `text` for a URL or a file name. Letters of every script stay; a
 * Latin letter loses its accent (`Café` → `cafe`); what is not a letter, digit, space, `_` or `-` goes.
 */
export function slugify(text: string): string {
  if (!isString(text)) {
    throw new TypeError('Input must be a string');
  }

  return (
    text
      .toLowerCase()
      .normalize('NFD')
      // only a Latin letter sheds its marks: й and ё keep theirs when composed back
      .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/[\s_-]+/gu, '-')
      .replace(/^-|-$/g, '')
  );
}
