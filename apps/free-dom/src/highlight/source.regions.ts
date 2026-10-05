import type { SourceLines, SourceToken } from './source.types';

/** The text of a source line, without its colors. */
export const lineText = (line: readonly SourceToken[]): string => line.map((token) => token.content).join('');

// a marker is a comment of its own line, `// #region name` or, in CSS,
// `/* #region name */`; it ends at its own `#endregion`, past the regions inside it
const markerOf = (line: readonly SourceToken[]): string | undefined =>
  /^(?:\/\/|\/\*) (#region \S+|#endregion)(?: \*\/)?$/.exec(lineText(line).trim())?.[1];

const isMarker = (line: readonly SourceToken[]): boolean => markerOf(line) !== undefined;

// how a line changes the depth of regions: a `#region` opens one, an `#endregion` closes one
const depthChange = (line: readonly SourceToken[]): number =>
  markerOf(line) === '#endregion' ? -1 : Number(isMarker(line));

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

/** The lines between a region's markers, with the indent they share taken off. */
export const sourceRegion = (source: SourceLines, name: string): SourceLines => {
  const start = source.findIndex((line) => markerOf(line) === `#region ${name}`);
  if (start === -1) {
    return [];
  }
  const after = source.slice(start + 1);
  let depth = 1;
  const length = after.findIndex((line) => (depth += depthChange(line)) === 0);
  const region = after.slice(0, length === -1 ? undefined : length).filter((line) => !isMarker(line));
  const indents = region
    .map(lineText)
    .filter((text) => text.trim() !== '')
    .map(indentOf);
  const width = indents.length === 0 ? 0 : Math.min(...indents);
  return region.map((line) => dedent(line, width));
};

/** A whole listing without its region markers, which only say where the snippets shown elsewhere begin and end. */
export const withoutRegions = (source: SourceLines): SourceLines => source.filter((line) => !isMarker(line));
