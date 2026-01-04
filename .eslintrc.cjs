const path = require('path');

module.exports = {
  root: true,
  ignorePatterns: ['node_modules', 'dist', 'build'],
  env: {
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.join(__dirname, 'tsconfig.eslint.json')],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'off',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      files: ['apps/server/**/*.{ts,tsx}'],
      env: {
        node: true,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: {
        browser: true,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
