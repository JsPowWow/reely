import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
  {
    // Vite queries (`./step.ts?highlight`) are resolved by Vite plugins, not by the import resolver.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\?highlight$'] }],
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
