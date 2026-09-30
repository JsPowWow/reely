import { isString } from '@reely/basics';

/** Capitalizes each word; with `allWords` false, only the first letter, lowercasing the rest. */
export function capitalize(text: string, allWords = true): string {
  if (!isString(text)) {
    throw new TypeError('Input must be a string');
  }

  if (!text) return text;

  if (allWords) {
    return text.replace(/(?<![\p{L}\p{M}\p{N}_])[\p{L}\p{N}_]/gu, (char) => char.toUpperCase());
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
