import babelParser from "@babel/eslint-parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["node_modules", "dist", "build"], // Ignore common folders
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
