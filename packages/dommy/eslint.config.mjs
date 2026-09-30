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
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
            '{projectRoot}/consumer/**',
          ],
          // bundled into dist with their types, so a consumer installs nothing but dommy
          ignoredDependencies: ['@reely/utils', '@reely/logger'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    // a consumer's code, checked by `consumer/check.mjs` with a consumer's tsconfig
    ignores: ['**/out-tsc', 'consumer/src'],
  },
  {
    // a dev script that runs the developer's own `npm`
    files: ['consumer/check.mjs'],
    rules: {
      'sonarjs/no-os-command-from-path': 'off',
    },
  },
  {
    // the experimental router is reported, not failed, until it is finished (JsPowWow/reely#4)
    files: ['src/lib/router/**'],
    rules: {
      'sonarjs/prefer-specific-assertions': 'warn',
      'sonarjs/no-skipped-tests': 'warn',
      'sonarjs/async-test-assertions': 'warn',
      'sonarjs/concise-regex': 'warn',
      'sonarjs/super-linear-regex': 'warn',
    },
  },
];
