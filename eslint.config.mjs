import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-useless-catch': 'off',
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-types': 0,
      'no-unreachable': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      //'no-unused-vars': 'warn',
      eqeqeq: 'off',
      'space-before-blocks': 'error',
      'no-await-in-loop': 'warn',
    },
  },
];
