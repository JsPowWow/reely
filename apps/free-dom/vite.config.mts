/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/free-dom',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md', 'netlify.toml', '*.svg']),
    viteStaticCopy({ targets: [{ src: 'src/assets/*', dest: 'assets' }] }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  } as const,
  test: {
    name: 'free-dom',
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
  esbuild: {
    jsx: 'transform' as const,
    jsxDev: false,
    jsxImportSource: '@reely/dommy',
    jsxInject: `import { jsx } from '@reely/dommy'`,
    jsxFactory: 'jsx',
  },
}));
