/// <reference types='vitest' />
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/emitter',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.lib.json',
      // one declaration file with the private @reely/utils inlined, as in the JS
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
    // the app's bundler minifies; unminified, a consumer's stack traces keep the real names
    minify: false,
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    name: '@reely/emitter',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
