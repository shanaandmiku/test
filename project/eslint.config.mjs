import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier/flat";
export default [
  {
    ignores: ["dist", "node_modules", ".npm-cache"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{ts,mts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "vue/multi-word-component-names": "off",
    },
  },
  eslintConfigPrettier,
];
