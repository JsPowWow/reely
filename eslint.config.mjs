import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  // https://github.com/import-js/eslint-plugin-import/
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    ignores: ['**/dist', '**/build', '**/labs-ignore', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:async',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:async'],
            },
            {
              sourceTag: 'scope:colors',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:colors'],
            },
            {
              sourceTag: 'scope:strings',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:strings'],
            },
            {
              sourceTag: 'scope:dommy',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dommy'],
            },
            {
              sourceTag: 'scope:logger',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:logger'],
            },
            // *************** Apps settings ****************************
            {
              sourceTag: 'scope:free-dom',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:dommy', 'scope:async', 'scope:colors', 'scope:strings'],
            },
          ],
        },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit', overrides: { constructors: 'off' } },
      ],
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '[iI]gnored',
        },
      ],
      'import/no-cycle': 'error',
      'import/max-dependencies': ['error', { max: 10, ignoreTypeImports: true }],
      // 'import/no-default-export': 'warn', TODO AR
      // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type'],
          pathGroups: [
            {
              group: 'sibling',
              pattern: './*.{css,scss}',
              position: 'after',
            },
            {
              group: 'parent',
              pattern: '../**/*.{css,scss}',
              position: 'after',
            },
            {
              group: 'internal',
              pattern: '@reely/**',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/index.ts', '**/index.cts', '**/index.mts', '**/index.js', '**/index.cjs', '**/index.mjs'],
    rules: { 'import/max-dependencies': ['error', { max: 60, ignoreTypeImports: true }] },
  },
  {
    files: ['**/*spec.js', '**/*spec.ts', '**/*test.js', '**/*test.ts'],
    // Override or add rules here
    rules: {
      'no-magic-numbers': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/vitest.config.mts'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
];
