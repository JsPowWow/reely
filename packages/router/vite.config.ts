/// <reference types='vitest' />
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/router',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.lib.json',
      // one declaration file, with the private @reely/utils inlined
      rollupTypes: true,
      bundledPackages: ['@reely/utils'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      fileName: (): string => 'index.js',
      formats: ['es' as const],
    },
    // the app minifies; unminified, stack traces keep names
    minify: false,
    outDir: 'dist',
    rolldownOptions: {
      external: ['@reely/basics', '@reely/signals'],
    },
    sourcemap: true,
  },
  test: {
    name: '@reely/router',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
