/// <reference types='vitest' />
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/dommy',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.lib.json',
      // one declaration file per entry, with the private @reely helpers inlined, so the
      // published types import nothing a consumer cannot install
      rollupTypes: true,
      bundledPackages: ['@reely/utils', '@reely/logger'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'jsx-runtime': resolve(import.meta.dirname, 'src/lib/jsx-runtime.ts'),
        router: resolve(import.meta.dirname, 'src/router.ts'),
        kit: resolve(import.meta.dirname, 'src/kit.ts'),
      },
      fileName: (_format: string, entryName: string): string => `${entryName}.js`,
      formats: ['es' as const],
    },
    minify: true,
    outDir: 'dist',
    rolldownOptions: {
      external: ['tslib', '@reely/basics', /^@reely\/signals/],
      output: {
        preserveModules: false,
        // code shared by the entries
        chunkFileNames: 'dommy-[hash].js',
      },
    },
    sourcemap: true,
  },
}));
