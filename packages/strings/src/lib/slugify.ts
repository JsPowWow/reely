import { isString } from '@reely/basics';

// Latin letters with no accent to strip: their plain spelling
const plainLatin: Readonly<Record<string, string>> = {
  ł: 'l',
  ß: 'ss',
  æ: 'ae',
  ø: 'o',
  œ: 'oe',
  đ: 'd',
  ð: 'd',
  þ: 'th',
  ħ: 'h',
  ı: 'i',
};

/**
 * A lowercase, hyphen-separated form of `text` for a URL or a file name. Letters of every script stay,
 * with the signs they are written with; a Latin letter loses its accent (`Café` → `cafe`, `Łódź` →
 * `lodz`); what is not a letter, a digit, a space, `_` or `-` goes.
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
      .replace(/[łßæøœđðþħı]/gu, (letter) => plainLatin[letter] ?? letter)
      .replace(/[^\p{L}\p{M}\p{Nd}\s_-]/gu, '')
      .replace(/[\s_-]+/gu, '-')
      .replace(/^-|-$/g, '')
  );
}
