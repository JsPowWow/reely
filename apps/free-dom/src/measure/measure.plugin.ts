import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { build } from 'esbuild';

import type { Plugin } from 'vite';

/** What the site says of a package, read from the repo when the site is built. */
export interface PackageFacts {
  readonly version: string;
  /** Everything its entries export, with the reely packages it uses, minified and gzipped. */
  readonly gzipBytes: number;
  /** The other reely packages it depends on, by directory name. */
  readonly uses: readonly string[];
  /** Its runtime dependencies from outside reely, by package name. */
  readonly outside: readonly string[];
  /** The values its entries export, sorted; types are not counted. */
  readonly exports: readonly string[];
}

const scope = '@reely/';

/** The names of the values `specifier` exports, as esbuild sees them once it is bundled. */
const exportsOf = async (specifier: string, resolveDir: string): Promise<readonly string[]> => {
  const { metafile } = await build({
    stdin: { contents: `export * from '${specifier}';`, resolveDir, loader: 'ts' },
    bundle: true,
    format: 'esm',
    write: false,
    metafile: true,
    logLevel: 'error',
  });
  return Object.values(metafile.outputs).flatMap((output) => output.exports);
};

/** Bundles `code` as an app would, from the packages built in the repo: minified, gzipped bytes. */
export const gzipOf = async (code: string, resolveDir: string): Promise<number> => {
  const { outputFiles } = await build({
    stdin: { contents: code, resolveDir, loader: 'ts' },
    bundle: true,
    format: 'esm',
    minify: true,
    write: false,
    logLevel: 'error',
  });
  return gzipSync(outputFiles.map((file) => file.text).join('')).length;
};

// Nx loads the Vite config, and so this plugin, to build its project graph before any package is
// built: the reely guards are not there to import yet.
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

interface Manifest {
  version: string;
  dependencies: readonly string[];
  /** The `exports` subpaths that are code: `.`, `./router`. */
  entries: readonly string[];
}

const readManifest = async (file: string): Promise<Manifest> => {
  const manifest: unknown = JSON.parse(await readFile(file, 'utf8'));
  if (!isRecord(manifest) || typeof manifest.version !== 'string') {
    throw new Error(`${file} names no version`);
  }
  const dependencies = isRecord(manifest.dependencies) ? Object.keys(manifest.dependencies) : [];
  const subpaths = isRecord(manifest.exports) ? Object.keys(manifest.exports) : ['.'];
  return { version: manifest.version, dependencies, entries: subpaths.filter((subpath) => !subpath.endsWith('.json')) };
};

export const factsOf = async (packagesDir: string, dir: string): Promise<PackageFacts> => {
  const { version, dependencies, entries } = await readManifest(join(packagesDir, dir, 'package.json'));
  const specifiers = entries.map((entry) => `${scope}${dir}${entry.slice(1)}`);
  // a namespace per entry keeps all of it, and entries that export the same names do not clash
  const everything = specifiers.map((specifier, index) => `export * as entry${index} from '${specifier}';`).join('\n');
  const names = await Promise.all(specifiers.map((specifier) => exportsOf(specifier, packagesDir)));
  return {
    version,
    gzipBytes: await gzipOf(everything, packagesDir),
    uses: dependencies.filter((name) => name.startsWith(scope)).map((name) => name.slice(scope.length)),
    outside: dependencies.filter((name) => !name.startsWith(scope)),
    exports: [...new Set(names.flat())].sort(),
  };
};

const moduleId = 'virtual:measures';
const resolvedId = `\0${moduleId}`;

/**
 * Vite plugin: `virtual:measures` holds the facts of each package (`packages`) and the size of each
 * bundle (`bundles`), measured from the packages built in the repo, so no figure is typed by hand.
 */
export const measures = ({
  packagesDir,
  packages,
  bundles,
}: {
  packagesDir: string;
  packages: readonly string[];
  bundles: Readonly<Record<string, string>>;
}): Plugin => ({
  name: 'free-dom:measures',
  resolveId: (id): string | null => (id === moduleId ? resolvedId : null),
  async load(id): Promise<string | null> {
    if (id !== resolvedId) {
      return null;
    }
    const facts = await Promise.all(packages.map(async (dir) => [dir, await factsOf(packagesDir, dir)] as const));
    const sizes = await Promise.all(
      Object.entries(bundles).map(async ([name, code]) => [name, await gzipOf(code, packagesDir)] as const)
    );
    return [
      `export const packages = ${JSON.stringify(Object.fromEntries(facts))};`,
      `export const bundles = ${JSON.stringify(Object.fromEntries(sizes))};`,
    ].join('\n');
  },
});
