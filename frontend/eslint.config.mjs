import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';


export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', }],
      'arrow-body-style': 'off',
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
      'linebreak-style': ['error','unix'],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@/quotes': ['error', 'single'],
      '@/indent': ['error',2],
      '@/object-curly-spacing': ['error', 'always'],
      '@/semi': 'error',
      '@/comma-dangle': 'off',
      '@/space-infix-ops': 'error',
      '@/lines-between-class-members': 'error',
      '@/no-extra-semi': 'error',
      '@/no-unused-vars': 'off',
    },
    settings: { react: { version: 'detect' } }
  }
];
