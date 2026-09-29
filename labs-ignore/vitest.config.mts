import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

// the labs run against dommy's source, the way the package specs do
const dommy = resolve(import.meta.dirname, '../packages/dommy/src');

export default defineConfig({
  root: import.meta.dirname,
  oxc: { jsx: { runtime: 'automatic' as const, importSource: '@reely/dommy' } },
  resolve: {
    alias: {
      '@reely/dommy/jsx-runtime': `${dommy}/lib/jsx-runtime.ts`,
      '@reely/dommy/jsx-dev-runtime': `${dommy}/lib/jsx-runtime.ts`,
      '@reely/dommy': `${dommy}/index.ts`,
    },
  },
  test: { name: 'labs', globals: true, environment: 'jsdom', include: ['*/**/*.spec.{ts,tsx}'], watch: false },
});
