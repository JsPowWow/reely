import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/index.ts', '**/index.cts', '**/index.mts', '**/index.js', '**/index.cjs', '**/index.mjs'],
    rules: { 'import/max-dependencies': ['error', { max: 60, ignoreTypeImports: true }] },
  },
];
