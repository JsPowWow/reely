// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { factsOf, gzipOf, measures } from './measure.plugin';

const packagesDir = join(import.meta.dirname, '../../../../packages');

describe('factsOf', () => {
  it('reads the version and the reely packages a package uses', async () => {
    const manifest: unknown = JSON.parse(await readFile(join(packagesDir, 'dommy-kit/package.json'), 'utf8'));

    const facts = await factsOf(packagesDir, 'dommy-kit');

    expect(facts.uses).toEqual(['basics', 'signals']);
    expect(manifest).toMatchObject({ version: facts.version });
  });

  it('weighs a package with the packages it uses', async () => {
    const [basics, signals, kit] = await Promise.all(
      ['basics', 'signals', 'dommy-kit'].map((dir) => factsOf(packagesDir, dir))
    );

    // signals stands on basics, dommy-kit on both
    expect(signals?.gzipBytes).toBeGreaterThan(basics?.gzipBytes ?? Infinity);
    expect(kit?.gzipBytes).toBeGreaterThan(signals?.gzipBytes ?? Infinity);
  });
});

describe('factsOf, for what a package exports', () => {
  it('names the values every entry exports, in order', async () => {
    const [basics, dommy] = await Promise.all([factsOf(packagesDir, 'basics'), factsOf(packagesDir, 'dommy')]);

    expect(basics.exports).toEqual(expect.arrayContaining(['forEachSettled', 'hasSome', 'isPlainObject']));
    expect(basics.exports).toEqual([...basics.exports].sort());
    expect(dommy.exports).toEqual(expect.arrayContaining(['For', 'jsx', 'createAsyncRouter']));
    expect(new Set(dommy.exports).size).toBe(dommy.exports.length);
  });
});

describe('factsOf, for a package of several entries', () => {
  it('weighs every entry, not only the main one', async () => {
    const [facts, main] = await Promise.all([
      factsOf(packagesDir, 'dommy'),
      gzipOf("export * from '@reely/dommy';", packagesDir),
    ]);

    expect(facts.gzipBytes).toBeGreaterThan(main);
  });
});

describe('gzipOf', () => {
  it('weighs only what the code imports', async () => {
    const [one, all] = await Promise.all([
      gzipOf("export { signal } from '@reely/signals';", packagesDir),
      gzipOf("export * from '@reely/signals';", packagesDir),
    ]);

    expect(one).toBeLessThan(all);
  });
});

describe('measures', () => {
  it('serves the facts and the bundle sizes as `virtual:measures`', async () => {
    const plugin = measures({ packagesDir, packages: ['basics'], bundles: { guard: "export { hasSome } from '@reely/basics';" } });
    const resolveId = plugin.resolveId as (id: string) => string;
    const load = plugin.load as (id: string) => Promise<string | null>;

    const code = await load(resolveId('virtual:measures'));

    expect(code).toMatch(/^export const packages = \{"basics":\{"version":"[\d.]+","gzipBytes":\d+,"uses":\[\],"exports":\[[^\]]*\]\}\};/);
    expect(code).toMatch(/export const bundles = \{"guard":\d+\};$/);
    expect(await load('other')).toBeNull();
  });
});
