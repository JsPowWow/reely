import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
  {
    // the game loop in `main.ts` still waits to be split into systems; until then it is reported, not failed
    files: ['src/main.ts'],
    rules: {
      'sonarjs/cognitive-complexity': 'warn',
    },
  },
];
