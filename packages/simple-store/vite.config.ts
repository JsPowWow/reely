/// <reference types='vitest' />
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// the published packages this one imports: they stay imports, so an app that uses several
// @reely packages ships each once; the private @reely/utils is bundled into the JS and the types
const external: string[] = ['@reely/emitter'];

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/simple-store',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.lib.json',
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
    rolldownOptions: { external },
  },
  test: {
    name: '@reely/simple-store',
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
