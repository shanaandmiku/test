import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import pluginVue from "eslint-plugin-vue"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  {
    ignores: ["dist", "node_modules", ".npm-cache"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["src/**/*.{js,mjs,cjs,jsx,ts,mts,tsx,vue}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  eslintConfigPrettier,
  {
    files: ["src/**/*.{js,mjs,cjs,jsx,ts,mts,tsx,vue}"],
    rules: {
      semi: ["error", "never"],
    },
  },
)
