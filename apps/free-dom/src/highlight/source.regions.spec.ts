import { lineText, sourceRegion, withoutRegions } from './source.regions';

import type { SourceLines } from './source.types';

const lines = (...texts: string[]): SourceLines => texts.map((text) => [{ content: text }]);
const texts = (source: SourceLines): string[] => source.map(lineText);

const source: SourceLines = [
  [{ content: 'const machine = {' }],
  [{ content: '  // #region ready' }],
  [{ content: '  ' }, { content: 'ready', color: '#e4e7eb' }, { content: ': {' }],
  [{ content: '    on: {},' }],
  [{ content: '  },' }],
  [{ content: '' }],
  [{ content: '  // #endregion' }],
  [{ content: '};' }],
];

describe('source regions', () => {
  it('cuts the lines between a region’s markers, taking off the indent they share', () => {
    const ready = sourceRegion(source, 'ready');

    expect(texts(ready)).toEqual(['ready: {', '  on: {},', '},', '']);
    expect(ready[0]).toEqual([{ content: 'ready', color: '#e4e7eb' }, { content: ': {' }]);
  });

  it('reads the markers of CSS as well', () => {
    const css = lines('.a {}', '/* #region flip */', '.turn {', '  transform: none;', '}', '/* #endregion */');

    expect(texts(sourceRegion(css, 'flip'))).toEqual(['.turn {', '  transform: none;', '}']);
    expect(texts(withoutRegions(css))).toEqual(['.a {}', '.turn {', '  transform: none;', '}']);
  });

  it('gives nothing for a region the source does not mark', () => {
    expect(sourceRegion(source, 'won')).toEqual([]);
  });

  it('leaves the markers out of a whole listing', () => {
    expect(texts(withoutRegions(lines('a', '// #region x', 'b', '  // #endregion', 'c')))).toEqual(['a', 'b', 'c']);
  });
});
