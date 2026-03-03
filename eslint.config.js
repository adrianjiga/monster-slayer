import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    // Vue is loaded via CDN script tag and exposed as a browser global
    files: ["app.js"],
    languageOptions: {
      globals: {
        Vue: "readonly",
      },
    },
  },
  {
    // Vitest globals for test files
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        vi: "readonly",
        afterEach: "readonly",
        beforeEach: "readonly",
      },
    },
  },
];
