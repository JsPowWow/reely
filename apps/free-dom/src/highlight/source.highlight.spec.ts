// @vitest-environment node
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { highlightSource, reelyCodeTheme, sourceHighlight } from './source.highlight';

import type { SourceLines } from './source.types';

// colors of the `a` tokens: in JSX both the opening and the closing tag are tags
const tagColors = (lines: SourceLines): (string | undefined)[] =>
  lines.flat().filter((token) => token.content === 'a').map((token) => token.color);

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

  it('reads JSX in a .tsx source: both tags of an element are tags', async () => {
    const lines = await highlightSource('const link = <a href="/">reely</a>;', 'tsx');

    expect(tagColors(lines)).toEqual([reelyCodeTheme.type, reelyCodeTheme.type]);
  });
});

describe('sourceHighlight', () => {
  // runs the plugin's `load` hook the way Vite does, with a context that records watched files
  const load = async (id: string): Promise<{ code: unknown; watched: string[] }> => {
    const watched: string[] = [];
    const hook = sourceHighlight().load as (this: unknown, id: string) => Promise<unknown>;
    const code = await hook.call({ addWatchFile: (file: string) => watched.push(file) }, id);
    return { code, watched };
  };

  const moduleSource = (code: unknown): SourceLines =>
    JSON.parse(String(code).replace(/^export default /, '').replace(/;$/, '')) as SourceLines;

  const moduleLines = (code: unknown): string[] =>
    moduleSource(code).map((line) => line.map((token) => token.content).join(''));

  it('leaves other modules to Vite', async () => {
    expect((await load('/src/step.ts?raw')).code).toBeNull();
  });

  it('exports the highlighted lines of the file, without its trailing blank lines', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'free-dom-')), 'step.ts');
    await writeFile(file, 'const count = 1;\n\n');

    const { code, watched } = await load(`${file}?highlight`);

    expect(moduleLines(code)).toEqual(['const count = 1;']);
    expect(watched).toEqual([file]);
  });

  it('reads a .tsx file as JSX', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'free-dom-')), 'step.tsx');
    await writeFile(file, 'const link = <a href="/">reely</a>;');

    const { code } = await load(`${file}?highlight`);

    expect(tagColors(moduleSource(code))).toEqual([reelyCodeTheme.type, reelyCodeTheme.type]);
  });
});
