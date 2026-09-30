/// <reference types='vitest' />
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/signals',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.lib.json',
      // one declaration file per entry, with the private @reely/utils inlined
      rollupTypes: true,
      bundledPackages: ['@reely/utils'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        testing: resolve(import.meta.dirname, 'src/testing.ts'),
      },
      fileName: (_format: string, entryName: string): string => `${entryName}.js`,
      formats: ['es' as const],
    },
    // the app minifies; unminified, stack traces keep names
    minify: false,
    outDir: 'dist',
    rolldownOptions: {
      external: ['@reely/basics'],
      output: {
        // the graph both entries share
        chunkFileNames: 'signals-[hash].js',
      },
    },
    sourcemap: true,
  },
  test: {
    name: '@reely/signals',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
    // the specs that check what the garbage collector frees call `gc()`
    env: {
      NODE_OPTIONS: '--expose-gc',
    },
  },
}));
