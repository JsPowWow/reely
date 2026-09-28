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
    // The registries import every demo and its source, two modules per page.
    files: ['src/pages/evolution/evolution.steps.ts', 'src/pages/docs/docs.topics.tsx'],
    rules: {
      'import/max-dependencies': 'off',
    },
  },
];
