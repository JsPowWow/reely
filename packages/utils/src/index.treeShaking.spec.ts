import { resolve } from 'node:path';

import { build } from 'esbuild';

const index = resolve(import.meta.dirname, 'index.ts');

const bundle = async (code: string): Promise<string> => {
  const { outputFiles } = await build({
    stdin: { contents: code, resolveDir: import.meta.dirname, loader: 'ts' },
    bundle: true,
    format: 'esm',
    ignoreAnnotations: true,
    write: false,
    logLevel: 'silent',
  });
  return outputFiles[0]?.text ?? '';
};

describe('@reely/utils tree shaking', () => {
  it('ships nothing for an import that uses nothing: no module runs code at the top level', async () => {
    expect((await bundle(`import '${index}';`)).trim()).toBe('');
  });

  it('ships only the helpers used and what they call, @reely/basics included', async () => {
    const text = await bundle(`import { withDefault } from '${index}';\nexport const used = withDefault;`);

    expect(
      text.match(/^\/\/ .*$/gm)?.map((line) => line.slice('// '.length).split('/').slice(-3).join('/'))
    ).toStrictEqual(['basics/dist/index.js', 'lib/nullable/withDefault.ts', '<stdin>']);
    expect(text).toContain('function hasSome');
    expect(text).not.toMatch(/forEachSettled|isPlainObject|reportUncaught/);
  });
});
