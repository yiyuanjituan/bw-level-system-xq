const process = require('node:process')

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    '@antfu/eslint-config',
  ],
  plugins: [
    // 插件会自动通过 @antfu/eslint-config 引入
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  rules: {
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-exports': 'off',
    'perfectionist/sort-named-exports': 'off',

    // 开发环境允许 console.log，生产环境不允许
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  ignorePatterns: [
    '.github/**',
  ],
}