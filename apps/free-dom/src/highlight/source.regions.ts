import type { SourceLines, SourceToken } from './source.types';

/** The text of a source line, without its colors. */
export const lineText = (line: readonly SourceToken[]): string => line.map((token) => token.content).join('');

const regionStart = (name: string): string => `// #region ${name}`;
const regionEnd = '// #endregion';

const isMarker = (line: readonly SourceToken[]): boolean => {
  const text = lineText(line).trim();
  return text.startsWith('// #region ') || text === regionEnd;
};

const indentOf = (text: string): number => text.length - text.trimStart().length;

// takes `width` characters of leading whitespace off a line, across as many tokens as it spans
const dedent = (line: readonly SourceToken[], width: number): SourceToken[] => {
  let left = width;
  return line.flatMap((token) => {
    const cut = Math.min(left, indentOf(token.content));
    left -= cut;
    const content = token.content.slice(cut);
    return content === '' && token.content !== '' ? [] : [{ ...token, content }];
  });
};

/** The lines between `// #region <name>` and the next `// #endregion`, with the indent they share taken off. */
export const sourceRegion = (source: SourceLines, name: string): SourceLines => {
  const start = source.findIndex((line) => lineText(line).trim() === regionStart(name));
  if (start === -1) {
    return [];
  }
  const length = source.slice(start + 1).findIndex((line) => lineText(line).trim() === regionEnd);
  const region = source.slice(start + 1, length === -1 ? undefined : start + 1 + length);
  const indents = region
    .map(lineText)
    .filter((text) => text.trim() !== '')
    .map(indentOf);
  const width = indents.length === 0 ? 0 : Math.min(...indents);
  return region.map((line) => dedent(line, width));
};

/** A whole listing without its region markers, which only say where the snippets shown elsewhere begin and end. */
export const withoutRegions = (source: SourceLines): SourceLines => source.filter((line) => !isMarker(line));
