import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
  {
    // Vite queries (`./step.ts?highlight`) and `virtual:` modules are resolved by Vite plugins; typecheck resolves them.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\?highlight$', '^@reely/[\\w-]+/', '^virtual:'] }],
    },
  },
  {
    // The registries import every demo and its source, two modules per page.
    files: [
      'src/pages/evolution/evolution.steps.ts',
      'src/pages/docs/docs.topics.tsx',
      'src/pages/docs/advanced.examples.tsx',
    ],
    rules: {
      'import/max-dependencies': 'off',
    },
  },
  {
    // A page composes the site's header, pager and meter with its own content.
    files: ['src/**/*.page.tsx'],
    rules: {
      'import/max-dependencies': ['error', { max: 15, ignoreTypeImports: true }],
    },
  },
];
