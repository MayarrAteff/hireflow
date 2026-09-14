module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
    'plugin:sonarjs/recommended',
    'plugin:@tanstack/query/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'commitlint.config.cjs', 'src/routeTree.gen.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['simple-import-sort', 'prettier', 'react-refresh', 'sonarjs', 'import', 'eslint-plugin-react-compiler'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react-refresh/only-export-components': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'react-compiler/react-compiler': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-console': 'error',
    'sonarjs/no-duplicate-string': 'off',
    'react/display-name': 'off',
    'import/no-default-export': ['error'],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'function-expression',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@mui/material',
            message: 'Use the path import instead. Example: import Typography from "@mui/material/Typography"',
          },
          {
            name: '@mui/icons-material',
            message: 'Use the path import instead. Example: import AddIcon from "@mui/icons-material/Add"',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['vite.config.ts', 'tailwind.config.ts', 'postcss.config.js'],
      rules: { 'import/no-default-export': 'off' },
    },
  ],
  settings: {
    react: { version: 'detect' },
  },
};
