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

  it('ships only the helpers used and what they call', async () => {
    const text = await bundle(`import { isSomeFunction } from '${index}';\nexport const used = isSomeFunction;`);

    expect(text.match(/^\/\/ .*$/gm)?.map((line) => line.slice('// '.length).split('/').at(-1))).toStrictEqual([
      'hasSome.ts',
      'isSomeFunction.ts',
      '<stdin>',
    ]);
  });
});
