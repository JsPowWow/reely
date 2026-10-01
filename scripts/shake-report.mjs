// What each export of a built @reely package costs alone, in a bundler that keeps `/*#__PURE__*/`
// and in one that ignores it, so a change to the package can be measured before and after.
// Usage, after `npx nx build <project>`: node scripts/shake-report.mjs <package dir> [entry subpath]
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { build } from 'esbuild';

const [dir, subpath = ''] = process.argv.slice(2);
if (!dir) {
  throw new Error('Usage: node scripts/shake-report.mjs <package dir, e.g. dommy> [entry subpath, e.g. router]');
}
const root = process.cwd();
const specifier = ['@reely', dir, subpath].filter(Boolean).join('/');
const entryFile = join(root, 'packages', dir, 'dist', `${subpath || 'index'}.js`);
const names = Object.keys(await import(entryFile)).sort();

const gzipped = async (code, ignoreAnnotations) => {
  const { outputFiles } = await build({
    stdin: { contents: code, resolveDir: root },
    bundle: true,
    format: 'esm',
    minify: true,
    ignoreAnnotations,
    write: false,
    logLevel: 'silent',
  });
  const text = outputFiles[0].text.trim();
  return text ? gzipSync(text).length : 0;
};
const row = async (label, code) =>
  `${label.padEnd(28)} ${String(await gzipped(code, false)).padStart(7)} ${String(await gzipped(code, true)).padStart(9)}`;

console.log(`${specifier}: B gzip, with annotations / ignoring them`);
console.log(await row('bare import', `import '${specifier}';`));
console.log(await row('everything', `import * as all from '${specifier}'; console.log(all);`));
for (const name of names) {
  console.log(await row(name, `import { ${name} } from '${specifier}'; console.log(${name});`));
}
