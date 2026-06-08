require("@rushstack/eslint-patch/modern-module-resolution");

const process = require("node:process");

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ["plugin:vue/vue3-essential", "@vue/eslint-config-typescript/recommended", "@vue/eslint-config-prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "prettier/prettier": "off",
    "vue/max-attributes-per-line": "off",
    "vue/first-attribute-linebreak": "off",
    "vue/html-closing-bracket-newline": "off"
  },
  ignorePatterns: [".github/**"]
};
