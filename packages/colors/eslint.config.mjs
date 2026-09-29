import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {},
  },
  {
    // older package, left as is
    files: ['**/*.ts', '**/*.js'],
    rules: { 'no-restricted-syntax': 'off' },
  },
];
