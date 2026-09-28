// Checks the packed package the way a consumer gets it: `npm pack`, a clean project,
// `npm i` of the tarball, strict `tsc` in both JSX modes (with the README examples),
// then a bundle of each JSX runtime run in jsdom.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const here = import.meta.dirname;
const packageDir = resolve(here, '..');
const tsc = resolve(packageDir, '../../node_modules/typescript/bin/tsc');
const work = mkdtempSync(join(tmpdir(), 'dommy-consumer-'));

const run = (command, args) => execFileSync(command, args, { cwd: work, encoding: 'utf8', stdio: 'pipe' });

try {
  const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', work], {
    cwd: packageDir,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .at(-1);
  writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
  cpSync(join(here, 'src'), join(work, 'src'), { recursive: true });
  cpSync(join(here, 'tsconfig.json'), join(work, 'tsconfig.json'));
  const readme = readFileSync(join(packageDir, 'README.md'), 'utf8');
  for (const [index, [, code]] of [...readme.matchAll(/```tsx?\n([\s\S]*?)```/g)].entries()) {
    writeFileSync(join(work, 'src', `readme-${index}.tsx`), `${code}\nexport {};\n`);
  }
  // the package has no dependencies, so the install never reaches a registry
  run('npm', ['install', '--no-audit', '--no-fund', '--registry', 'https://registry.npmjs.org', `./${tarball}`]);

  for (const jsx of ['react-jsx', 'react-jsxdev']) {
    run(process.execPath, [tsc, '-p', work, '--jsx', jsx]);
  }

  const { window } = new JSDOM('<!doctype html><body></body>');
  for (const name of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'Text', 'Comment']) {
    globalThis[name] = window[name];
  }
  globalThis.DocumentFragment = window.DocumentFragment;

  for (const jsxDev of [false, true]) {
    const outfile = join(work, `out/board-${jsxDev ? 'dev' : 'prod'}.js`);
    const options = {
      absWorkingDir: work,
      bundle: true,
      format: 'esm',
      jsx: 'automatic',
      jsxDev,
      jsxImportSource: '@reely/dommy',
      logLevel: 'error',
    };
    await build({ ...options, entryPoints: ['src/board.tsx'], outfile });
    const { start } = await import(pathToFileURL(outfile).href);
    const dispose = start(document.body);
    assert.match(document.body.innerHTML, /Leader: Bolt/);
    assert.equal(document.querySelectorAll('li').length, 2);
    assert.match(document.body.innerHTML, /--car-color: red/);
    dispose();
    assert.equal(document.body.innerHTML, '');

    // what a component returns that is not a node still renders, and stays bound
    const counterFile = join(work, `out/counter-${jsxDev ? 'dev' : 'prod'}.js`);
    await build({ ...options, entryPoints: ['src/counter.tsx'], outfile: counterFile });
    const { labelled } = await import(pathToFileURL(counterFile).href);
    const parent = document.createElement('div');
    labelled(parent);
    parent.querySelector('button').click();
    assert.equal(parent.innerHTML, '1<button>1</button>');
  }
  // tree shaking: an app that uses only signals ships no element factories
  writeFileSync(join(work, 'signals-only.ts'), "import { effect, signal } from '@reely/dommy';\neffect(() => signal(0).value);\n");
  const { outputFiles } = await build({
    absWorkingDir: work,
    entryPoints: ['signals-only.ts'],
    bundle: true,
    format: 'esm',
    minify: true,
    write: false,
    logLevel: 'error',
  });
  const signalsOnly = outputFiles[0].text;
  assert.doesNotMatch(signalsOnly, /"abbr"|createElementNS/, 'a signals-only bundle keeps the element factories');
  console.log(`signals-only bundle: ${gzipSync(signalsOnly).length} B gzip`);

  console.log(`@reely/dommy consumer check passed: ${tarball}`);
} catch (error) {
  // tsc and npm report on stdout
  console.error(error.stdout ?? '', error.stderr ?? '');
  throw error;
} finally {
  rmSync(work, { recursive: true, force: true });
}
