import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Compiled Cloud Functions output. `tsconfig.json` already excludes
    // `functions/`, but eslint was still linting the emitted JS and reporting
    // ~34 unfixable errors, which made `npm run lint` useless as a gate.
    "functions/lib/**",
  ]),
]);

export default eslintConfig;
