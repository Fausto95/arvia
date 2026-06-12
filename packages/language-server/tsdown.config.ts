import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/server.ts"],
    format: ["cjs"],
    dts: true,
    sourcemap: true,
    target: "es2022",
  },
  // Browser-safe core for in-page embedders (website playground): no LSP
  // transport, no node APIs.
  {
    entry: ["src/browser.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    target: "es2022",
    platform: "neutral",
  },
]);
