module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "max-len": ["error", {"code": 120}],
    "comma-dangle": ["off"],
    "object-curly-spacing": ["off"],
  },
  overrides: [
    {
      files: ["**/*.spec.*", "*.vue"],
      env: {
        mocha: true,
      },
      rules: {
        "max-len": "off",
        "vue/max-len": [
          "error",
          {
            code: 120,
            template: 9000,
            ignoreTemplateLiterals: true,
            ignoreUrls: true,
            ignoreStrings: true,
          },
        ],
      },
    },
  ],
  globals: {},
};
  