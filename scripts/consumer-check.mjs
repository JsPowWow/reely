// A package as a consumer gets it: packed with its @reely dependencies, installed in a clean
// project, `consumer/*.ts` compiled (strict, no DOM lib unless `consumer/tsconfig.json` asks for one)
// and run (with `--readme`, the README's `ts` examples compiled too), then tree shaking checked:
// a bare import ships nothing, and `consumer/shake.json` names are declared `once` or are `absent`.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

import { build } from 'esbuild';

const packageDir = process.cwd();
const packagesDir = resolve(packageDir, '..');
const tsc = resolve(packagesDir, '../node_modules/typescript/bin/tsc');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'reely-consumer-'));

const run = (command, args, cwd = work) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });

const withLocalDependencies = (dir, seen = new Set()) => {
  if (seen.has(dir)) {
    return seen;
  }
  seen.add(dir);
  const { dependencies = {} } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  for (const name of Object.keys(dependencies).filter((dependency) => dependency.startsWith('@reely/'))) {
    withLocalDependencies(join(packagesDir, name.slice('@reely/'.length)), seen);
  }
  return seen;
};

try {
  const shakeFile = join(packageDir, 'consumer', 'shake.json');
  // a package whose types name a platform global (`AbortSignal`) states the lib its consumer has
  const tsconfigFile = join(packageDir, 'consumer', 'tsconfig.json');
  const { compilerOptions: ownOptions = {} } = existsSync(tsconfigFile)
    ? JSON.parse(readFileSync(tsconfigFile, 'utf8'))
    : {};
  const shakeCases = existsSync(shakeFile) ? JSON.parse(readFileSync(shakeFile, 'utf8')) : [];
  // with `--readme`, the README's `ts` examples compile against the packed packages too, but are not run
  const examples = process.argv.includes('--readme')
    ? [...readFileSync(join(packageDir, 'README.md'), 'utf8').matchAll(/```ts\n([\s\S]*?)```/g)].map(([, code]) => code)
    : [];
  assert.ok(!process.argv.includes('--readme') || examples.length > 0, 'the README has no ```ts example');
  // the other @reely packages a case or an example uses together with this one
  const usedTogether = [...shakeCases.map(({ code }) => code), ...examples].flatMap((code) =>
    [...code.matchAll(/['"`]@reely\/([\w-]+)['"`]/g)].map(([, dir]) => dir)
  );
  const packageDirs = new Set();
  for (const dir of [packageDir, ...usedTogether.map((name) => join(packagesDir, name))]) {
    withLocalDependencies(dir, packageDirs);
  }
  const tarballs = [...packageDirs].map(
    (dir) => `./${run('npm', ['pack', '--silent', '--pack-destination', work], dir).trim().split('\n').at(-1)}`
  );
  writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
  cpSync(join(packageDir, 'consumer'), join(work, 'src'), { recursive: true, filter: (from) => !from.endsWith('.json') });
  writeFileSync(
    join(work, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'es2022',
        module: 'nodenext',
        lib: ['es2022'],
        types: [],
        outDir: 'out',
        rootDir: 'src',
        ...ownOptions,
      },
      include: ['src'],
    })
  );
  run('npm', ['install', '--no-audit', '--no-fund', '--registry', 'https://registry.npmjs.org', ...tarballs]);
  run(process.execPath, [tsc, '-p', work]);
  if (examples.length > 0) {
    mkdirSync(join(work, 'readme'));
    examples.forEach((code, index) =>
      writeFileSync(join(work, 'readme', `example-${index}.ts`), `${code}\nexport {};\n`)
    );
    writeFileSync(
      join(work, 'tsconfig.readme.json'),
      JSON.stringify({
        extends: './tsconfig.json',
        compilerOptions: { noEmit: true, rootDir: '.' },
        include: ['readme'],
      })
    );
    run(process.execPath, [tsc, '-p', join(work, 'tsconfig.readme.json')]);
  }
  for (const file of readdirSync(join(work, 'out')).filter((name) => name.endsWith('.js'))) {
    run(process.execPath, [join(work, 'out', file)]);
  }

  const bundle = async (code, minify) => {
    const { outputFiles } = await build({
      stdin: { contents: code, resolveDir: work, loader: 'ts' },
      absWorkingDir: work,
      bundle: true,
      format: 'esm',
      minify,
      write: false,
      logLevel: 'error',
    });
    return outputFiles[0].text;
  };
  // ignoreAnnotations: pure code, not just `sideEffects: false`
  for (const ignoreAnnotations of [false, true]) {
    const { outputFiles } = await build({
      stdin: { contents: `import '${manifest.name}';`, resolveDir: work },
      absWorkingDir: work,
      bundle: true,
      format: 'esm',
      minify: true,
      ignoreAnnotations,
      write: false,
      logLevel: 'error',
    });
    assert.equal(outputFiles[0].text.trim(), '', `importing ${manifest.name} ships code (ignoreAnnotations: ${ignoreAnnotations})`);
  }
  for (const { name, code, absent = [], once = [] } of shakeCases) {
    const text = await bundle(code, false);
    const declarations = (declared) =>
      text.match(new RegExp(`\\b(?:var|let|const|function|class) ${declared}\\d*\\b`, 'g'))?.length ?? 0;
    for (const declared of absent) {
      assert.equal(declarations(declared), 0, `${name}: the bundle declares ${declared}`);
    }
    for (const declared of once) {
      assert.equal(declarations(declared), 1, `${name}: the bundle declares ${declared} not exactly once`);
    }
    console.log(`${name}: ${gzipSync(await bundle(code, true)).length} B gzip`);
  }
  console.log(`${manifest.name} consumer check passed: ${tarballs.join(', ')}`);
} catch (error) {
  // tsc and npm report on stdout
  console.error(error.stdout ?? '', error.stderr ?? '');
  throw error;
} finally {
  rmSync(work, { recursive: true, force: true });
}
