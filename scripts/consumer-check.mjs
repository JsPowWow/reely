// Checks a package the way a consumer gets it: `npm pack` of it and of the `@reely/*` packages it
// depends on, `npm i` of the tarballs in a clean project, strict `tsc` without the DOM library on
// the package's `consumer/*.ts`, then each compiled file run in Node (it throws when a check fails).
// Last, tree shaking: an app that imports the package and uses nothing ships nothing, and each
// case of `consumer/shake.json` bundles its code with esbuild, as an app would, and counts the
// declarations of each name, including the copies esbuild renames (`EventEmitter2`): `absent`
// names must have none, `once` names exactly one.
// Run from the package directory: `node ../../scripts/consumer-check.mjs`.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

/** The directories of the package and of every `@reely/*` package it needs at run time. */
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
  const tarballs = [...withLocalDependencies(packageDir)].map(
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
      },
      include: ['src'],
    })
  );
  // the packed @reely packages bundle their private helpers, so the install needs nothing else
  run('npm', ['install', '--no-audit', '--no-fund', '--registry', 'https://registry.npmjs.org', ...tarballs]);
  run(process.execPath, [tsc, '-p', work]);
  for (const file of readdirSync(join(work, 'out')).filter((name) => name.endsWith('.js'))) {
    run(process.execPath, [join(work, 'out', file)]);
  }

  /** Bundles `code` the way an app does, unminified so names stay searchable, and minified to size it. */
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
  // pure without the help of `"sideEffects": false`: no top-level code runs, so nothing is kept
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
  const shakeFile = join(packageDir, 'consumer', 'shake.json');
  for (const { name, code, absent = [], once = [] } of existsSync(shakeFile) ? JSON.parse(readFileSync(shakeFile, 'utf8')) : []) {
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
