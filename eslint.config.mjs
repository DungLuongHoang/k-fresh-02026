import typescriptEslint from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  { ignores: ['.agents/**'] },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      '@/object-curly-spacing': ['error', 'always'],

      'no-trailing-spaces': [
        'error',
        {
          skipBlankLines: false,
        },
      ],
      semi: ['error', 'always'],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 2,
          maxEOF: 0,
        },
      ],

      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      'no-empty-pattern': 'warn',
      'preserve-caught-error': 'off',
      'no-useless-assignment': 'off',
      '@typescript-eslint/no-explicit-any': ['off'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // delegated to unused-imports/no-unused-vars which respects ^_ pattern
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/typedef': [
        'warn',
        {
          variableDeclaration: false,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off', // temporarily off until MR 20/20
    },
  },
  // ── scripts/ folder: plain Node.js CommonJS, no TS rules ─────────────────
  {
    languageOptions: {
      parser: undefined,
      globals: {
        require:  'readonly',
        module:   'readonly',
        exports:  'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process:  'readonly',
        console:  'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports':         'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-undef': 'off',
    },
  },
  // NOTE: blocks for the local `playwright-tags` plugin were removed because
  // the supporting `scripts/eslint-local-rules/` package no longer exists in
  // this workspace. Re-add them once the local rules module is restored.
];
