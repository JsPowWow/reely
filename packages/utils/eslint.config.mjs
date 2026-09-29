import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {},
  },
  {
    // the guards live here
    files: ['**/*.ts', '**/*.js'],
    rules: { 'no-restricted-syntax': 'off' },
  },
];
