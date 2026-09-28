import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

// JSX specs compile against this package's own runtime, the way a consumer's `jsxImportSource` does
const jsxRuntime = resolve(import.meta.dirname, 'src/lib/jsx-runtime.ts');

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/dommy',
  oxc: {
    jsx: { runtime: 'automatic' as const, importSource: '@reely/dommy' },
  },
  resolve: {
    alias: {
      '@reely/dommy/jsx-runtime': jsxRuntime,
      '@reely/dommy/jsx-dev-runtime': jsxRuntime,
    },
  },
  test: {
    name: '@reely/dommy',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
    env: {
      NODE_OPTIONS: '--expose-gc',
    },
  },
}));
