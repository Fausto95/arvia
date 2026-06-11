import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  // CJS build exists for tsserver plugins (@arviahq/typescript-plugin), which Node requires as CommonJS.
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
});
