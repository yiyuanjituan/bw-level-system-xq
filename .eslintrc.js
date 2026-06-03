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
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: {
          max: 10
        },
        multiline: {
          max: 1
        }
      }
    ],
    "vue/first-attribute-linebreak": [
      "error",
      {
        singleline: "beside",
        multiline: "below"
      }
    ],
    "vue/html-closing-bracket-newline": [
      "error",
      {
        singleline: "never",
        multiline: "always"
      }
    ]
  },
  ignorePatterns: [".github/**"]
};
