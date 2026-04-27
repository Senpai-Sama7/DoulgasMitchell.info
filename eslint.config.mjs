import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules — ENABLED for code quality
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": ["warn", { "ts-expect-error": "allow-with-description" }],
    "@typescript-eslint/prefer-as-const": "warn",

    // React rules — ENABLED to prevent hook bugs
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/purity": "warn",
    "react/no-unescaped-entities": "off", // Content pages use apostrophes
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",

    // Next.js rules
    "@next/next/no-img-element": "warn",
    "@next/next/no-html-link-for-pages": "warn",

    // General JavaScript rules — ENABLED for correctness
    "prefer-const": "warn",
    "no-unused-vars": "off", // Covered by @typescript-eslint/no-unused-vars
    "no-console": "off", // Logger wraps console; some debug console.* is fine
    "no-debugger": "error", // Must not ship debugger statements
    "no-empty": "warn",
    "no-irregular-whitespace": "warn",
    "no-case-declarations": "off", // Pattern matching uses declarations
    "no-fallthrough": "warn",
    "no-mixed-spaces-and-tabs": "warn",
    "no-redeclare": "warn",
    "no-undef": "warn",
    "no-unreachable": "warn",
    "no-useless-escape": "warn",
  },
}, {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    "examples/**",
    "skills",
    ".vercel/**",
  ]
}];

export default eslintConfig;
