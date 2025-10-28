import eslintNextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    plugins: {
      next: eslintNextPlugin,
    },
    settings: {
      // Next.js root directory
      next: {
        rootDir: ".",
      },
    },
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "node_modules",
      ".next/",
      "out/",
      "public/",
      "dist",
      "build",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
    ],
    extends: [
      "plugin:next/recommended",
      "plugin:next/core-web-vitals",
      "plugin:next/typescript",
      "prettier",
    ],
    rules: {
      /* Base JS Rules */
      "no-undef": "error",
      "no-unused-vars": "off",
      "no-console": "warn",

      /* TypeScript Rules */
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": "warn",

      /* Next.js Rules */
      "@next/next/no-img-element": "off",
    },
    /*
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname,
      ecmaFeatures: { jsx: true },
    },
    */
    globals: {
      React: "writable",
      JSX: "writable",
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
    },
  },
]);
