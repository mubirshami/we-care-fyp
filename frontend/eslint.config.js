const js = require('@eslint/js');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      // Calling async fetchers from useEffect is a valid pattern; this rule
      // fires false positives when setState is called inside async callbacks.
      'react-hooks/set-state-in-effect': 'off',
      // Date.now() used for relative-date filtering in render is intentional
      // and does not cause instability in this app.
      'react-hooks/purity': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
];
