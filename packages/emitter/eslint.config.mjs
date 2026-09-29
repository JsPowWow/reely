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
          // a type of a private field only: it leaves neither the JS nor the .d.ts
          ignoredDependencies: ['@reely/utils'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    // checked by scripts/consumer-check.mjs
    ignores: ['**/out-tsc', 'consumer'],
  },
];
