import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist', 'node_modules', '.npm-cache'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,mts,tsx}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
      globals: {
        // 库源码默认不注入 browser 全局变量。
        // 如果后面确实需要少量约定好的全局变量，在这里显式补充。
        // __TEMPLATE_VERSION__: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  eslintConfigPrettier,
  {
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,mts,tsx}'],
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
    },
  },
)
