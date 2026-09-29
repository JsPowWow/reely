import baseConfig from '../../eslint.config.mjs';
import jsoncEslintParser from 'jsonc-eslint-parser';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    // built by tsc with `nodenext`: relative imports name the emitted `.js`, which tsc itself resolves
    rules: { 'import/no-unresolved': ['error', { ignore: ['^\\./.*\\.js$'] }] },
  },
  {
    files: ['*.json'],
    languageOptions: {
      parser: jsoncEslintParser,
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          ignoredDependencies: ['@reely/utils'],
        },
      ],
    },
  },
];
