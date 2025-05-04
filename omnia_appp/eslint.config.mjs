import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable all rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      "no-var": "off",
      "prefer-const": "off",
      "no-empty": "off",
      "no-empty-function": "off",
      "no-unreachable": "off",
      "no-unsafe-finally": "off",
      "no-unsafe-negation": "off",
      "no-unsafe-optional-chaining": "off",
      "no-useless-escape": "off",
      "no-prototype-builtins": "off",
      "no-constant-condition": "off",
      "no-dupe-else-if": "off",
      "no-duplicate-case": "off",
      "no-fallthrough": "off",
      "no-invalid-regexp": "off",
      "no-irregular-whitespace": "off",
      "no-misleading-character-class": "off",
      "no-obj-calls": "off",
      "no-regex-spaces": "off",
      "no-sparse-arrays": "off",
      "no-template-curly-in-string": "off",
      "no-unexpected-multiline": "off",
      "no-unreachable-loop": "off",
      "no-unsafe-assignment": "off",
      "no-unsafe-call": "off",
      "no-unsafe-member-access": "off",
      "no-unsafe-return": "off",
      "require-atomic-updates": "off",
      "use-isnan": "off",
      "valid-typeof": "off"
    }
  },
];

export default eslintConfig;
