import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Airbnb-style rules for Node.js
      'no-console': 'off', // Allow console in Node.js
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': ['error', 'always'],
      'quote-props': ['error', 'as-needed'],
      'no-array-constructor': 'error',
      'array-callback-return': 'error',
      'prefer-destructuring': ['error', {
        array: true,
        object: true,
      }, {
        enforceForRenamedProperties: false,
      }],
      'no-useless-escape': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-new-func': 'error',
      'no-param-reassign': ['error', {
        props: false,
      }],
      'arrow-body-style': ['error', 'as-needed'],
      'no-confusing-arrow': ['error', {
        allowParens: true,
      }],
      'no-duplicate-imports': 'error',
      'no-iterator': 'error',
      'dot-notation': 'error',
      'no-undef': 'error',
      'one-var': ['error', 'never'],
      'no-multi-assign': 'error',
      'eqeqeq': ['error', 'always'],
      'no-case-declarations': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'spaced-comment': ['error', 'always'],
      'no-new-wrappers': 'error',
      'radix': 'error',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    },
  },
];
