import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "pnpm-lock.yaml",
      "prisma/migrations",
      "public",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {},
  },
];
