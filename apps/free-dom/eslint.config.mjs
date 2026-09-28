import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
  {
    // Vite queries (`./step.ts?highlight`) are resolved by Vite plugins, and package subpaths
    // (`@reely/dommy/router`) through `exports`, which the node import resolver cannot read;
    // typecheck resolves both.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\?highlight$', '^@reely/dommy/'] }],
    },
  },
  {
    // The step registry imports every step and its source, two modules per step.
    files: ['src/pages/tutorial/tutorial.steps.ts'],
    rules: {
      'import/max-dependencies': 'off',
    },
  },
];
