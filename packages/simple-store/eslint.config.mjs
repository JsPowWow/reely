import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
          ],
          // bundled into dist with its types, so a consumer installs only published packages
          ignoredDependencies: ['@reely/utils'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    // a consumer's code, checked by `scripts/consumer-check.mjs` with a consumer's tsconfig
    ignores: ['**/out-tsc', 'consumer'],
  },
];
