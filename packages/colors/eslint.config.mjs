import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    // built by tsc with `nodenext`: relative imports name the emitted `.js`, which tsc itself resolves
    rules: { 'import/no-unresolved': ['error', { ignore: ['^\\./.*\\.js$'] }] },
  },
];
