import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['**/out-tsc'],
  },
  {
    // Vite asset queries (`./file.tsx?raw`) are resolved by Vite, not by the import resolver.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\?raw$'] }],
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
