import { isString } from '@reely/basics';

/** A lowercase, hyphen-separated form of `text` for a URL: drops what is not a letter, digit, space, `_` or `-`. */
export function slugify(text: string): string {
  if (!isString(text)) {
    throw new TypeError('Input must be a string');
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
