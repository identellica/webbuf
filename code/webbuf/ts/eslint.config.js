import { createRequire } from "node:module";

// This shared config is outside the packages. Resolve its tooling through the
// core package, which declares both dependencies, under Bun's isolated linker.
const require = createRequire(
  new URL("./webbuf/package.json", import.meta.url),
);
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      "**/dist/",
      "**/node_modules/",
      "**/rs-*-bundler/",
      "**/rs-*-inline-base64/",
      "eslint.config.js",
      "wbcom/",
    ],
  },
);
