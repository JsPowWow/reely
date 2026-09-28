// @vitest-environment node
import { highlightSource, reelyCodeTheme } from './source.highlight';

const colorOf = (lines: Awaited<ReturnType<typeof highlightSource>>, content: string): string | undefined =>
  lines.flat().find((token) => token.content.trim() === content)?.color;

describe('highlightSource', () => {
  it('keeps the lines of the source, token by token', async () => {
    const code = "import { signal } from '@reely/dommy';\n\nconst count = signal(0);";

    const lines = await highlightSource(code, 'ts');

    expect(lines.map((line) => line.map((token) => token.content).join(''))).toEqual(code.split('\n'));
  });

  it('colors tokens with the reely theme', async () => {
    const lines = await highlightSource('// a comment\nconst count = 1;', 'ts');

    expect(colorOf(lines, '// a comment')).toBe(reelyCodeTheme.comment);
    expect(colorOf(lines, 'const')).toBe(reelyCodeTheme.keyword);
    expect(colorOf(lines, '1')).toBe(reelyCodeTheme.number);
  });

  it('reads JSX in a .tsx source', async () => {
    const lines = await highlightSource('const link = <a href="/">reely</a>;', 'tsx');

    expect(colorOf(lines, '"/"')).toBe(reelyCodeTheme.string);
  });
});
