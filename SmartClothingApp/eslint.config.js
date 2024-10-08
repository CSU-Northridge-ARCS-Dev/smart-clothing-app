//const { ESLint } = require("eslint");

module.exports = [
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        globals: {
          require: "readonly",
          process: "readonly",
          module: "readonly",
          __dirname: "readonly",
          console: "readonly",
          Buffer: "readonly",
          setTimeout: "readonly",
          clearTimeout: "readonly",
          setInterval: "readonly",
          clearInterval: "readonly",
        },
      },
      rules: {
        "object-curly-spacing": ["error", "never"],
        quotes: ["error", "double"],
        "prefer-const": "error",
        indent: ["error", 2],
        "max-len": ["error", { code: 80 }],
        "comma-dangle": ["error", "always-multiline"],
        "arrow-parens": ["error", "always"],
      },
    },
  ];
  