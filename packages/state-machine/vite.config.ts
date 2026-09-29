/// <reference types='vitest' />
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// published @reely packages stay imports, so an app ships each once
const external: string[] = ['@reely/basics', '@reely/emitter', '@reely/queue'];

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/state-machine',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.lib.json',
      rollupTypes: true,
      // the private @reely/utils is bundled, never imported
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
    sourcemap: true,
    rolldownOptions: { external },
  },
  test: {
    name: '@reely/state-machine',
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
