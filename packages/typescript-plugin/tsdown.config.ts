import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/languagePlugin.ts", "src/tsserver.ts", "src/cli.ts"],
  // CJS only: tsserver loads plugins with require(), and Volar's quickstart
  // helpers live in the CommonJS world (mirrors @vue/typescript-plugin).
  format: ["cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
  external: ["typescript"],
});
