import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
  {
    // Vite queries (`./step.ts?highlight`) are resolved by Vite plugins; typecheck resolves them.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\?highlight$', '^@reely/[\\w-]+/'] }],
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
